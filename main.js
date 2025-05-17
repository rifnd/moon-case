import config from './config.js'
import { Client, Serialize } from './lib/serialize.js'
import baileys from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import Pino from 'pino'
import NodeCache from 'node-cache'
import chalk from 'chalk'
import readline from 'readline'
import fs from 'fs'

const { useMultiFileAuthState, DisconnectReason, makeInMemoryStore, jidNormalizedUser, makeCacheableSignalKeyStore, PHONENUMBER_MCC, Browsers, fetchLatestBaileysVersion } = baileys
const database = (new (await import('./lib/database.js')).default())
const store = makeInMemoryStore({ logger: Pino({ level: 'silent' }).child({ level: 'silent' }) })
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

// start connect to client
async function start() {
   process.on('unhandledRejection', (err) => console.error(err))

   const content = await database.read()
   if (content && Object.keys(content).length === 0) {
      global.db = { users: {}, groups: {}, setting: {}, ...(content || {}) }
      await database.write(global.db)
   } else {
      global.db = content
   }

   const { version, isLatest } = await fetchLatestBaileysVersion()
   const { state, saveCreds } = await useMultiFileAuthState(`./${config.options.sessionName}`)
   const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"

   const conn = baileys.default({
      version,
      logger: Pino({ level: 'fatal' }).child({ level: 'fatal' }), // hide log
      printQRInTerminal: config.pairing.state ? false : true, // popping up QR in terminal log
      auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'fatal' }).child({ level: 'fatal' })),
      },
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)
         return msg?.message || ''
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })

   // bind store, write store maybe
   store.bind(conn.ev)

   // push update name to store.contacts
   conn.ev.on('contacts.update', (update) => {
      for (let contact of update) {
         let id = jidNormalizedUser(contact.id)
         if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
      }
   })

   // bind extra client
   await Client({ conn, store })

   // login use pairing code
   if (config.pairing.state && !conn.authState.creds.registered) {
      let phoneNumber
      if (!!config.pairing.number) {
         phoneNumber = config.pairing.number.toString().replace(/[^0-9]/g, '')
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example : 62xxx")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example : 62xxx")))
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }
      setTimeout(async () => {
         let code = await conn.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }

   // for auto restart when error client
   conn.ev.on('connection.update', async (update) => {
      const { lastDisconnect, connection, qr } = update
      if (connection === 'close') {
         let reason = new Boom(lastDisconnect?.error)?.output.statusCode
         if (reason === DisconnectReason.badSession) {
            console.log(`Bad Session File, Please Delete Session and Scan Again`)
            process.send('reset')
         } else if (reason === DisconnectReason.connectionClosed) {
            console.log('Connection closed, reconnecting....')
            await start()
         } else if (reason === DisconnectReason.connectionLost) {
            console.log('Connection Lost from Server, reconnecting...')
            await start()
         } else if (reason === DisconnectReason.connectionReplaced) {
            console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First')
            process.exit(1)
         } else if (reason === DisconnectReason.loggedOut) {
            console.log(`Device Logged Out, Please Scan Again And Run.`)
            process.exit(1)
         } else if (reason === DisconnectReason.restartRequired) {
            console.log('Restart Required, Restarting...')
            await start()
         } else if (reason === DisconnectReason.timedOut) {
            console.log('Connection TimedOut, Reconnecting...')
            process.send('reset')
         } else if (reason === DisconnectReason.multideviceMismatch) {
            console.log('Multi device mismatch, please scan again')
            process.exit(0)
         } else {
            console.log(reason)
            process.send('reset')
         }
      }
      if (connection === 'open') {
         console.log('Connected, you login as : ' + '[ ' + conn.user.name + ' ]')
      }
   })

   // write session
   conn.ev.on('creds.update', saveCreds)

   // messages
   conn.ev.on('messages.upsert', async (message) => {
      if (!message.messages) return
      const m = await Serialize(conn, message.messages[0])
      await (await import(`./lib/system/message.js?v=${Date.now()}`)).default(conn, m, message, database)
   })

   // group participants update
   conn.ev.on('group-participants.update', async (message) => {
      await (await import(`./lib/system/group-participants.js?v=${Date.now()}`)).default(conn, message)
   })

   // group update
   conn.ev.on('groups.update', async (update) => {
      await (await import(`./lib/system/group-update.js?v=${Date.now()}`)).default(conn, update)
   })

   // auto reject call when user call
   conn.ev.on('call', async (json) => {
      if (config.options.antiCall) {
         for (const id of json) {
            if (id.status === 'offer') {
               let msg = await conn.sendMessage(id.from, {
                  text: `Maaf untuk saat ini, Kami tidak dapat menerima panggilan, entah dalam group atau pribadi\n\nJika Membutuhkan bantuan ataupun request fitur silahkan chat owner :p`,
                  mentions: [id.from],
               })
               conn.sendContact(id.from, config.options.owner, msg)
               await conn.rejectCall(id.id, id.from)
            }
         }
      }
   })

   // rewrite database every 30 seconds
   setInterval(async () => {
      if (global.db) await database.write(global.db)
   }, 30000) // write database every 30 seconds

   if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

   /** auto clear tmp */
   setInterval(() => {
      try {
         const tmpFiles = fs.readdirSync('./temp')
         if (tmpFiles.length > 0) {
            tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
         }
      } catch { }
   }, 60 * 1000 * 10) // every 10 minute

   return conn
}
start().catch(() => start())