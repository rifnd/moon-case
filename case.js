process.on('uncaughtException', console.error) //Error log
require('./config')
const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const {
  exec
} = require('child_process')

module.exports = client = async (client, m, chatUpdate, store) => {
  try {
    var body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
    var budy = (typeof m.text == 'string' ? m.text : '')
    var prefix = prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : prefa ?? global.prefix
    const isCmd = body.startsWith(prefix)
    const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
    const args = body.trim().split(/ +/).slice(1)
    const pushname = m.pushName || 'No Name'
    const botNumber = await hisoka.decodeJid(hisoka.user.id)
    const isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const itsMe = m.sender == botNumber ? true : false
    const text = q = args.join(" ")
    const fatkuns = (m.quoted || m)
    const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    const qmsg = (quoted.msg || quoted)
    const isMedia = /image|video|sticker|audio/.test(mime)

    // Group
    const groupMetadata = m.isGroup ? await hisoka.groupMetadata(m.chat).catch(e => {}) : ''
    const groupName = m.isGroup ? groupMetadata.subject : ''
    const participants = m.isGroup ? await groupMetadata.participants : ''
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isPremium = isCreator || global.premium.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || false

    /** Schema */
    try {
      let isNumber = (x) => typeof x === "number" && !isNaN(x)
      /** users */
      let user = global.db.data.users[m.sender]
      if (typeof user !== 'object') global.db.data.users[m.sender] = {}
      if (user) {
        if (!isNumber(user.afkTime)) user.afkTime = -1
        if (!('afkReason' in user)) user.afkReason = ''
      } else global.db.data.users[m.sender] = {
        afkTime: -1,
        afkReason: '',
      }
      /** chats */
      let chats = global.db.data.chats[m.chat]
      if (typeof chats !== 'object') global.db.data.chats[m.chat] = {}
      if (chats) {
        if (!('antilink' in chats)) chats.antilink = false
      } else global.db.data.chats[m.chat] = {
        antilink: false
      }
      /** settings */
      let setting = global.db.data.settings[botNumber]
      if (typeof setting !== 'object') global.db.data.settings[botNumber] = {}
      if (setting) {} else global.db.data.settings[botNumber] = {}

    } catch (err) {
      console.error(err)
    }

    // Public & Self
    if (!client.public) {
      if (!m.key.fromMe) return
    }

    // Push Message To Console && Auto Read
    if (m.message) {
      client.readMessages([m.key])
      console.log(chalk.black(chalk.bgWhite('[ PESAN ]')), chalk.black(chalk.bgGreen(new Date())), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('FROM'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('IN'), chalk.green(m.isGroup ? pushname : 'PC', m.chat))
    }

    // write database every 1 minute
    setInterval(() => {
      fs.writeFileSync('./src/database.json', JSON.stringify(global.db, null, 2))
    }, 60 * 1000)

    switch (command) {
        
      case prefix + 'public': {
        if (!isCreator) return client.sendText(m.chat, status.owner, m)
        client.public = true
        client.sendText(m.chat, 'Success change to public', m)
      }
      break
        
      case prefix + 'self': {
        if (!isCreator) client.sendText(m.chat, status.owner, m)
        client.public = false
        client.sendText(m.chat, 'Success change to self', m)
      }
      break

      case prefix + 'owner':
      case prefix + 'creator': {
        client.sendContact(m.chat, global.set.owner, m)
      }
      break

      default:
        if (budy.startsWith('=>')) {
          if (!isCreator) return client.sendText(m.chat, status.owner, m)
          function Return(sul) {
            sat = JSON.stringify(sul, null, 2)
            bang = util.format(sat)
            if (sat == undefined) {
              bang = util.format(sul)
            }
            return client.sendText(m.chat, bang, m)
          }
          try {
            client.sendText(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
          } catch (e) {
            m.reply(String(e))
          }
        }

        if (budy.startsWith('>')) {
          if (!isCreator) return m.reply(mess.owner)
          try {
            let evaled = await eval(budy.slice(2))
            if (typeof evaled !== 'string')
              evaled = require("util").inspect(evaled)
            await m.reply(evaled)
          } catch (err) {
            await m.reply(String(err))
          }
        }

        if (budy.startsWith('$')) {
          if (!isCreator) return m.reply(mess.owner)
          exec(budy.slice(2), (err, stdout) => {
            if (err) return m.reply(err)
            if (stdout) return m.reply(stdout)
          })
        }

        if (isCmd && budy.toLowerCase() != undefined) {
          if (m.chat.endsWith("broadcast")) return;
          if (m.isBaileys) return;
          let msgs = global.db.data.database;
          if (!(budy.toLowerCase() in msgs)) return;
          client.copyNForward(m.chat, msgs[budy.toLowerCase()], true);
        }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});