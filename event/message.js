import config from '../config.js'
import Func from '../lib/function.js'
import fs from 'fs'
import chalk from 'chalk'
import axios from 'axios'
import path from 'path'
import { getBinaryNodeChildren } from '@whiskeysockets/baileys'
import { exec } from 'child_process'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __filename = Func.__filename(import.meta.url)
const require = createRequire(import.meta.url)

export default async function Message(conn, m, chatUpdate) {
  try {
    if (!m) return
    if (!config.options.public && !m.isOwner) return
    if (m.from && db.groups[m.from]?.mute && !m.isOwner) return
    if (m.isBaileys) return

    (await import('../lib/loadDatabase.js')).default(m)

    const prefix = m.prefix
    const isCmd = m.body.startsWith(prefix)
    const command = isCmd ? m.command.toLowerCase() : ''
    const quoted = m.isQuoted ? m.quoted : m

    // LOG Chat
    if (m.message && !m.isBaileys) {
      console.log(chalk.black(chalk.bgWhite('- FROM')), chalk.black(chalk.bgGreen(m.pushName)), chalk.black(chalk.yellow(m.sender)) + '\n' + chalk.black(chalk.bgWhite('- IN')), chalk.black(chalk.bgGreen(m.isGroup ? m.metadata.subject : 'Private Chat', m.from)) + '\n' + chalk.black(chalk.bgWhite('- MESSAGE')), chalk.black(chalk.bgGreen(m.body || m.type)))
    }

    switch (command) {

      /** main menu */
      case 'menu': case 'help': {
        let text = `Hi @${m.sender.split`@`[0]}, This is a list of available commands\n\n*Total Command :* ${Object.values(config.menu).map(a => a.length).reduce((total, num) => total + num, 0)}\n\n`

        Object.entries(config.menu).map(([type, command]) => {
          text += `╭─「 *${Func.toUpper(type)} Menu* 」\n`
          text += `│\n`
          text += `│ • ${command.map(a => `${prefix + a}`).join('\n│ • ')}\n`
          text += `│\n`
          text += `╰────\n\n`
        }).join('\n\n')
        return conn.sendMessageModify(m.from, text, m, {
          largeThumb: true,
          url: config.set.link
        })
      }
      break

      case 'speed': {
        const { promisify } = (await import('util'))
        const cp = (await import('child_process')).default
        let execute = promisify(exec).bind(cp)
        m.reply('Testing Speed...')
        let o
        try {
          o = exec(`speedtest --accept-license`) // install speedtest-cli
        } catch (e) {
          o = e
        } finally {
          let { stdout, stderr } = o
          if (stdout) return m.reply(stdout)
          if (stderr) return m.reply(stderr)
        }
      }
      break

      case 'owner': case 'creator': {
        conn.sendContact(m.from, config.options.owner, m)
      }
      break

      case 'sc': case 'sourcecode': {
        m.reply('https://github.com/rifnd/moon-case')
      }
      break

      case 'ping': {
        const moment = (await import('moment-timezone')).default
        const calculatePing = function (timestamp, now) {
          return moment.duration(now - moment(timestamp * 1000)).asSeconds()
        }
        m.reply(`*Ping :* *_${calculatePing(m.timestamp, Date.now())} second(s)_*`)
      }
      break

      case 'quoted': case 'q': {
        const { Serialize } = (await import('../lib/serialize.js'))
        if (!m.isQuoted) m.reply('quoted')
        try {
          const message = await Serialize(conn, (await conn.loadMessage(m.from, m.quoted.id)))
          if (!message.isQuoted) return m.reply('Quoted Not Found')
          conn.sendMessage(m.from, { forward: message.quoted })
        } catch {
          m.reply('Quoted Not Found')
        }
      }
      break

      /* owner menu  */
      case 'public': {
        if (!m.isOwner) return m.reply('owner')
        if (config.options.public) {
          config.options.public = false
          m.reply('Switch Bot To Self Mode')
        } else {
          config.options.public = true
          m.reply('Switch Bot To Public Mode')
        }
      }
      break

      case 'mute': {
        if (!m.isOwner) return m.reply('owner')
        let db = global.db.groups[m.from]
        if (db.mute) {
          db.mute = false
          m.reply('Succes Unmute This Group')
        } else if (!db.mute) {
          db.mute = true
          m.reply('Succes Mute This Group')
        }
      }
      break

      case 'setpp': case 'setprofile': case 'seticon': {
        const media = await quoted.download()
        if (m.isOwner && !m.isGroup) {
          if (/full/i.test(m.text)) await conn.setProfilePicture(conn?.user?.id, media, "full")
          else if (/(de(l)?(ete)?|remove)/i.test(m.text)) await conn.removeProfilePicture(conn.decodeJid(conn?.user?.id))
          else await conn.setProfilePicture(conn?.user?.id, media, 'normal')
        } else if (m.isGroup && m.isAdmin && m.isBotAdmin) {
          if (/full/i.test(m.text)) await conn.setProfilePicture(m.from, media, 'full')
          else if (/(de(l)?(ete)?|remove)/i.test(m.text)) await conn.removeProfilePicture(m.from)
          else await conn.setProfilePicture(m.from, media, 'normal')
        }
      }
      break

      case 'setname': {
        if (m.isOwner && !m.isGroup) {
          await conn.updateProfileName(m.isQuoted ? quoted.body : quoted.text)
        } else if (m.isGroup && m.isAdmin && m.isBotAdmin) {
          await conn.groupUpdateSubject(m.from, m.isQuoted ? quoted.body : quoted.text)
        }
      }
      break

      /* convert menu  */
      case 'sticker': case 's': case 'stiker': {
        if (/image|video|webp/i.test(quoted.mime)) {
          m.reply('wait')
          const buffer = await quoted.download()
          if (quoted?.msg?.seconds > 10) return m.reply(`Max video 9 second`)
          let exif
          if (m.text) {
            let [packname, author] = m.text.split('|')
            exif = { packName: packname ? packname : '', packPublish: author ? author : '' }
          } else {
            exif = { ...config.Exif }
          }
          m.reply(buffer, { asSticker: true, ...exif })
        } else if (m.mentions[0]) {
          m.reply('wait')
          let url = await conn.profilePictureUrl(m.mentions[0], 'image');
          m.reply(url, { asSticker: true, ...config.Exif })
        } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/i.test(m.text)) {
          m.reply('wait')
          m.reply(Func.isUrl(m.text)[0], { asSticker: true, ...config.Exif })
        } else {
          m.reply(`Method Not Support`)
        }
      }
      break

      case 'toimg': case 'toimage': {
        let { webp2mp4File } = (await import('../lib/sticker.js'))
        if (!/webp/i.test(quoted.mime)) return m.reply(`Reply Sticker with command ${prefix + command}`)
        if (quoted.isAnimated) {
          let media = await webp2mp4File((await quoted.download()))
          await m.reply(media)
        }
        let media = await quoted.download()
        await m.reply(media, { mimetype: 'image/png' })
      }
      break

      /* group menu  */
      case 'hidetag': case 'ht': case 'h': {
        if (!m.isGroup) return m.reply('group')
        if (!m.isAdmin) return m.reply('admin')
        let mentions = m.metadata.participants.map(a => a.id)
        let mod = await conn.cMod(m.from, quoted, /hidetag|tag|ht|h|totag/i.test(quoted.body.toLowerCase()) ? quoted.body.toLowerCase().replace(prefix + command, "") : quoted.body)
        conn.sendMessage(m.from, { forward: mod, mentions })
      }
      break

      case 'add': {
        if (!m.isGroup) return m.reply('group')
        if (!m.isAdmin) return m.reply('admin')
        if (!m.isBotAdmin) return m.reply('botAdmin')
        let users = m.mentions.length !== 0 ? m.mentions.slice(0, 2) : m.isQuoted ? [m.quoted.sender] : m.text.split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').slice(0, 2)
        if (users.length == 0) return m.reply('Fuck You 🖕')
        await conn.groupParticipantsUpdate(m.from, users, 'add').then(async (res) => {
          for (let i of res) {
            if (i.status == 403) {
              let node = getBinaryNodeChildren(i.content, 'add_request')
              await m.reply(`Can't add @${i.jid.split('@')[0]}, send invitation...`)
              let url = await conn.profilePictureUrl(m.from, 'image').catch(_ => 'https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu')
              await conn.sendGroupV4Invite(i.jid, m.from, node[0]?.attrs?.code || node.attrs.code, node[0]?.attrs?.expiration || node.attrs.expiration, m.metadata.subject, url, 'Invitation to join my WhatsApp Group')
            } else if (i.status == 409) return m.reply(`@${i.jid?.split('@')[0]} already in this group`)
            else m.reply(Func.format(i))
          }
        })
      }
      break

      case 'welcome': {
        if (!m.isAdmin) return m.reply('admin')
        let db = global.db.groups[m.from]
        if (db.welcome) {
          db.welcome = false
          m.reply('Succes Deactive Welcome on This Group')
        } else if (!db.welcome) {
          db.welcome = true
          m.reply('Succes Activated Welcome on This Group')
        }
      }
      break

      case 'leaving': {
        if (!m.isAdmin) return m.reply('admin')
        let db = global.db.groups[m.from]
        if (db.leave) {
          db.leave = false
          m.reply('Succes Deactive Leaving on This Group')
        } else if (!db.leave) {
          db.leave = true
          m.reply('Succes Activated Leaving on This Group')
        }
      }
      break

      case 'linkgroup': case 'linkgrup': case 'linkgc': {
        if (!m.isGroup) return m.reply('group')
        if (!m.isAdmin) return m.reply('admin')
        if (!m.isBotAdmin) return m.reply('botAdmin')
        await m.reply('https://chat.whatsapp.com/' + (await conn.groupInviteCode(m.from)))
      }
      break

      /* tools menu  */
      case 'fetch': case 'get': {
        if (!/^https:\/\//i.test(m.text)) return m.reply(`No Query?\n\nExample : ${prefix + command} https://api.alyachan.pro`)
        m.reply('wait')
        let mime = (await import('mime-types'))
        const res = await axios.get(Func.isUrl(m.text)[0], { responseType: 'arraybuffer' })
        if (!/utf-8|json|html|plain/.test(res?.headers?.get('content-type'))) {
          let fileName = /filename/i.test(res.headers?.get("content-disposition")) ? res.headers?.get("content-disposition")?.match(/filename=(.*)/)?.[1]?.replace(/["';]/g, '') : ''
          return m.reply(res.data, { fileName, mimetype: mime.lookup(fileName) })
        }
        let text = res?.data?.toString() || res?.data
        text = format(text)
        try {
          m.reply(text.slice(0, 65536) + '')
        } catch (e) {
          m.reply(format(e))
        }
      }
      break

      case 'rvo': {
        if (!quoted.msg.viewOnce) return m.reply(`Reply view once with command ${prefix + command}`)
        quoted.msg.viewOnce = false
        await conn.sendMessage(m.from, { forward: quoted }, { quoted: m })
      }
      break

      /* non command */
      default:
      /** eval */
      if (['>', 'eval', '=>'].some(a => m.body?.toLowerCase()?.startsWith(a))) {
        if (!m.isOwner) return m.reply('owner')
        let evalCmd = ''
        try {
          evalCmd = /await/i.test(m.text) ? eval('(async() => { ' + m.text + ' })()') : eval(m.text)
        } catch (e) {
          evalCmd = e
        }
        new Promise(async (resolve, reject) => {
          try {
            resolve(evalCmd)
          } catch (err) {
            reject(err)
          }
        })
        ?.then((res) => m.reply(format(res)))
        ?.catch((err) => m.reply(format(err)))
      }
      
      /** exec */
      if (['$', 'exec'].some(a => m.body?.toLowerCase()?.startsWith(a))) {
        if (!m.isOwner) return m.reply('owner')
        try {
          exec(m.text, async (err, stdout) => {
            if (err) return m.reply(Func.format(err))
            if (stdout) return m.reply(Func.format(stdout))
          })
        } catch (e) {
          m.reply(Func.format(e))
        }
      }
      
      /** test */
      if (/^bot/i.test(m.body)) {
        m.reply(`Bot Activated "${m.pushName}"`)
      }
    }
  } catch (e) {
    m.reply(format(e))
  }
}