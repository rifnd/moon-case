require('./config')
const {
  default: clientConnect,
  useMultiFileAuthState,
  DisconnectReason,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
  PHONENUMBER_MCC
} = require('@adiwajshing/baileys')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const chalk = require('chalk')
const FileType = require('file-type')
const _ = require('lodash')
const PhoneNumber = require('awesome-phonenumber')
const {
  smsg
} = require('./lib/myfunc')

const readline = require('readline')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

var low
try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}
const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' }),
})

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ? new mongoDB(opts['db']) : new JSONFile(`./database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) => setInterval(function () {
      !global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null
    }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
    users: {},
    chats: {},
    settings: {},
    sticker: {},
    ...(global.db.data || {}),
  }
  global.db.chain = _.chain(global.db.data);
}
loadDatabase()

// save database every 30seconds
if (global.db)
  setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)

async function startclient() {
  const { state, saveCreds } = await useMultiFileAuthState(`./session`)
  const client = clientConnect({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['Chrome (Linux)', '', ''],
    printQRInTerminal: opts['pairing'] ? false : true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  })
  store.bind(client.ev)
    
  if (opts['pairing'] && !client.authState.creds.registered) {
    let phoneNumber
    if (!!global.set.pairingNumber) {
      phoneNumber = global.set.pairingNumber.toString().replace(/[^0-9]/g, '') 
      if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example : 62xxx")))
        process.exit(0)
      }
    } else {
      phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
      // Ask again when entering the wrong number
      if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example : 62xxx")))  
        phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number : `)))
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
        rl.close()
      }
    }
    setTimeout(async () => {
      let code = await client.requestPairingCode(phoneNumber)
      code = code?.match(/.{1,4}/g)?.join("-") || code
      console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
    }, 3000)
  }

  // Anti Call
  client.ev.on('call', async (oncall) => {
    let botNumber = await client.decodeJid(client.user.id)
    let ch = db.data.settings[botNumber].anticall
    if (!ch) return
    console.log(oncall)
    for (let conn of oncall) {
      if (conn.isGroup == false) {
        if (conn.status == 'offer') {
          await client.updateBlockStatus(conn.from, 'block')
        }
      }
    }
  })
    
  client.ev.on('messages.upsert', async (chatUpdate) => {
    //console.log(JSON.stringify(chatUpdate, undefined, 2))
    try {
      mek = chatUpdate.messages[0]
      if (!mek.message) return
      mek.message = Object.keys(mek.message)[0] === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message
      if (mek.key && mek.key.remoteJid === 'status@broadcast') return
      if (!client.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
      if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
      if (mek.key.id.startsWith('moon')) return
      m = smsg(client, mek, store)
      require('./case')(client, m, chatUpdate, store)
    } catch (err) {
      console.log(err)
    }
  })

  client.ev.on('group-participants.update', async (anu) => {
    console.log(anu)
    try {
      let metadata = await client.groupMetadata(anu.id)
      let participants = anu.participants
      for (let num of participants) {
        // Get Profile Picture User
        try {
          ppuser = await client.profilePictureUrl(num, 'image')
        } catch {
          ppuser = 'https://tinyurl.com/yx93l6da'
        }
        // Get Profile Picture Group
        try {
          ppgroup = await client.profilePictureUrl(anu.id, 'image')
        } catch {
          ppgroup = 'https://tinyurl.com/yx93l6da'
        }
        if (anu.action == 'add') {
          client.sendMessage(anu.id, {
            image: { url: ppuser },
            mentions: [num],
            caption: `Welcome To ${metadata.subject} @${num.split('@')[0]}`,
          })
        } else if (anu.action == 'remove') {
          client.sendMessage(anu.id, {
            image: { url: ppuser },
            mentions: [num],
            caption: `@${num.split('@')[0]} Leaving To ${metadata.subject}`,
          })
        } else if (anu.action == 'promote') {
          client.sendMessage(anu.id, {
            image: { url: ppuser },
            mentions: [num],
            caption: `@${num.split('@')[0]} Promote From ${metadata.subject}`,
          })
        } else if (anu.action == 'demote') {
          client.sendMessage(anu.id, {
            image: { url: ppuser },
            mentions: [num],
            caption: `@${num.split('@')[0]} Demote From ${metadata.subject}`,
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  })

  // Setting
  client.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return ((decode.user && decode.server && decode.user + '@' + decode.server) || jid)
    } else return jid
  }

  client.ev.on('contacts.update', (update) => {
    for (let contact of update) {
      let id = client.decodeJid(contact.id)
      if (store && store.contacts)
        store.contacts[id] = { id, name: contact.notify }
    }
  })

  /**
   * 
   * @param {*} jid 
   * @param {*} withoutContact 
   * @returns 
   */
  client.getName = (jid, withoutContact = false) => {
    id = client.decodeJid(jid)
    withoutContact = client.withoutContact || withoutContact
    let v
    if (id.endsWith('@g.us'))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {}
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {}
        resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
      })    
    else v = id === '0@s.whatsapp.net' ? {
      id,
      name: 'WhatsApp',
    } : id === client.decodeJid(client.user.id) ? client.user : store.contacts[id] || {}  
    return ((withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
  }

  /**
   * 
   * @param {*} jid 
   * @param {*} kon 
   * @param {*} quoted 
   * @param {*} opts 
   */
  client.sendContact = async (jid, kon, quoted = '', opts = {}) => {
    let list = []
    for (let i of kon) {
      list.push({
        displayName: await client.getName(i + '@s.whatsapp.net'),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await client.getName(i + '@s.whatsapp.net')}\nFN:${await client.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:okeae2410@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/cak_haho\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      })
    }
    client.sendMessage(jid, {
      contacts: { 
        displayName: `${list.length} Kontak`, contacts: list
      },
      ...opts,
    }, { quoted })
  }

  /**
   * 
   * @param {*} status 
   * @returns 
   */
  client.setStatus = (status) => {
    client.query({
      tag: 'iq',
      attrs: {
        to: '@s.whatsapp.net',
        type: 'set',
        xmlns: 'status',
      },
      content: [{
        tag: 'status',
        attrs: {},
        content: Buffer.from(status, 'utf-8'),
      }],
    })  
    return status
  }
  
  client.public = true

  client.serializeM = (m) => smsg(client, m, store)
    
  client.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`)
        client.logout()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log('Connection closed, reconnecting....')
        startclient()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log('Connection Lost from Server, reconnecting...')
        startclient()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First')
        client.logout()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`)
        client.logout()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart Required, Restarting...')
        startclient()
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection TimedOut, Reconnecting...')
        startclient()
      } else if (reason === DisconnectReason.Multidevicemismatch) {
        console.log('Multi device mismatch, please scan again')
        client.logout()
      } else client.end(`Unknown DisconnectReason: ${reason}|${connection}`)
    }
    console.log('Connected...', update)
  })
  client.ev.on('creds.update', saveCreds)

  /**
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} quoted
   * @param {*} options
   * @returns
   */
  client.sendText = (jid, text, quoted = '', options) => client.sendMessage(jid, { text: text, ...options }, { quoted })

  /**
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} quoted
   * @param {*} options
   * @returns
   */
  client.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    client.sendMessage(
      jid,
      {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
            (v) => v[1] + "@s.whatsapp.net"
          ),
        },
        ...options,
      },
      { quoted }
    );

  /**
   *
   * @param {*} message
   * @param {*} filename
   * @param {*} attachExtension
   * @returns
   */
  client.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    // save to file
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  /**
   * 
   * @param {*} message 
   * @returns 
   */
  client.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  };

  /**
   * @param {*} jid
   * @param {*} message
   * @param {*} quoted
   * @param {*} options
   */
  client.reply = async (jid, text, quoted, options) => {
    await client.sendPresenceUpdate('composing', jid)
    return client.sendMessage(jid, {
      text: text,
      mentions: parseMention(text),
      ...options,
    }, { quoted })
  }

  /**
   *
   * @param {*} jid
   * @param {*} message
   * @param {*} forceForward
   * @param {*} options
   * @returns
   */
  client.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype
    if (options.readViewOnce) {
      message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : message.message || undefined
      vtype = Object.keys(message.message.viewOnceMessage.message)[0]
      delete (message.message && message.message.ignore ? message.message.ignore : message.message || undefined)
      delete message.message.viewOnceMessage.message[vtype].viewOnce
      message.message = {
        ...message.message.viewOnceMessage.message,
      }
    }
    let mtype = Object.keys(message.message)[0]
    let content = await generateForwardMessageContent(message, forceForward)
    let ctype = Object.keys(content)[0]
    let context = {}
    if (mtype != 'conversation') context = message.message[mtype].contextInfo
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo,
    }
    const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? {
      contextInfo: {
        ...content[ctype].contextInfo,
        ...options.contextInfo
      },
    } : {})} : {})
      
    await client.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id
    })  
    return waMessage
  }

/**
 * 
 * @param {*} jid 
 * @param {*} copy 
 * @param {*} text 
 * @param {*} sender 
 * @param {*} options 
 * @returns 
 */
  client.cMod = (jid, copy, text = '', sender = client.user.id, options = {}) => {
    //let copy = message.toJSON()
    let mtype = Object.keys(copy.message)[0]
    let isEphemeral = mtype === 'ephemeralMessage'
    if (isEphemeral) { mtype = Object.keys(copy.message.ephemeralMessage.message)[0] }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
    let content = msg[mtype]
    if (typeof content === 'string') msg[mtype] = text || content
    else if (content.caption) content.caption = text || content.caption
    else if (content.text) content.text = text || content.text
    if (typeof content !== 'string')
    msg[mtype] = { ...content, ...options }
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
    if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
    else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
    copy.key.remoteJid = jid
    copy.key.fromMe = sender === client.user.id
    return proto.WebMessageInfo.fromObject(copy)
  }
  return client
}
startclient()
require('http').createServer((_, res) => res.end('Uptime!')).listen(8080)

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Update ${__filename}`))
  delete require.cache[file]
  require(file)
})