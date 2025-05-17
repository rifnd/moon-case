import 'dotenv/config'
import AlyaApi from '@moonr/api'
import config from '../../config.js'
import Func from '../function.js'
import Scraper from '../scraper.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import moment from 'moment-timezone'
import {
   getBinaryNodeChildren,
   generateWAMessage
} from '@whiskeysockets/baileys'
import {
   exec
} from 'child_process'
import {
   format,
   promisify
} from 'util'
import {
   fileURLToPath
} from 'url'
import {
   createRequire
} from 'module'
import yts from 'yt-search'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __filename = Func.__filename(import.meta.url)
const require = createRequire(import.meta.url)
const Api = new AlyaApi()

export default async function Message(conn, m, chatUpdate, database) {
   try {
      if (!m) return
      if (!config.options.public && !m.isOwner) return
      if (m.from && db.groups[m.from]?.mute && !m.isOwner) return
      if (m.isBot) return

      const prefix = m.prefix
      const isCmd = m.body.startsWith(prefix)
      const command = isCmd ? m.command.toLowerCase() : ''
      const quoted = m.isQuoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''
      const isMedia = /(document|audio|sticker|image|video)/.test(mime)

      await (await import('./event.js')).default(conn, m)
      await (await import('../logs.js')).default(m)
      await (await import('../schema.js')).default(m)

      switch (command) {
         /** menu */
         case 'menu':
         case 'help': {
            let d = new Date(new Date + 3600000)
            let locale = 'id'
            let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
            let week = d.toLocaleDateString(locale, { weekday: 'long' })
            let date = d.toLocaleDateString(locale, {
               day: 'numeric',
               month: 'long',
               year: 'numeric'
            })
            let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
               day: 'numeric',
               month: 'long',
               year: 'numeric'
            }).format(d)
            let time = d.toLocaleTimeString(locale, {
               hour: 'numeric',
               minute: 'numeric',
               second: 'numeric'
            })
            let text = `${Func.greeting()} @${m.sender.split`@`[0]}👋\n`
            text += `\n`
            text += `⎔ Date : ${week} ${weton}, ${date}\n`
            text += `⎔ Islamic Date : ${dateIslamic}\n`
            text += `⎔ Time : ${time}\n`
            text += `\n`
            text += `⎔ Uptime : ${Func.toTime(process.uptime() * 1000)}\n`
            text += `⎔ API : https://api.alyachan.dev\n`
            text += `⎔ Github : https://github.com/rifnd/moon-case\n`
            text += `\n`
            Object.entries(config.menu).sort((a, b) => a[0].localeCompare(b[0])).forEach(([type, commands]) => {
               text += `⎔   ${Func.toUpper(type)}\n\n`
               if (commands.length > 0) {
                  text += `┌  ${prefix}${commands[0]}\n`
                  for (let i = 1; i < commands.length - 1; i++) {
                     text += `│  ${prefix}${commands[i]}\n`
                  }
                  if (commands.length > 1) {
                     text += `└  ${prefix}${commands[commands.length - 1]}\n`
                  }
               }
               text += `\n`
            })
            return conn.sendMessageModify(m.from, text + config.options.footer, m, {
               largeThumb: true,
               thumbnail: global.db.setting.cover,
               url: global.db.setting.link
            })
         }
         break

         /** misc menu */
         case 'owner':
         case 'creator': {
            conn.sendContact(m.from, config.options.owner, m)
         }
         break
         case 'sc':
         case 'sourcecode': {
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
         case 'run':
         case 'runtime': {
            m.reply(`${Func.toTime(process.uptime() * 1000)}`)
         }
         break
         case 'apikey':
         case 'checkapi': {
            m.reply('Checking API Key...')
            const json = await Api.get('v1/check-key')
            m.reply(Func.Format(json))
         }
         break
         case 'groups': {
            try {
               let groups = Object.entries(await conn.groupFetchAllParticipating()).map(entry => entry[1]).filter(group => !group.isCommunity)
               if (groups.length === 0) return m.reply('Bot does not join any groups')
               let capt = 'List Group :\n\n'
               groups.map((x, i) => {
                  let v = global.db.groups[x.id]
                  if (!v) {
                     global.db.groups[x.id] = {
                        activity: 0,
                        mute: false,
                        text_welcome: '',
                        text_leave: '',
                        welcome: true,
                        leave: true,
                        detect: false,
                        antilink: false,
                        member: {},
                        expired: 0
                     }
                  }
                  capt += `*${(i + 1)}.* ${x.subject}\n`
                  capt += `│ Expired : ${v.expired == 0 ? 'NOT SET' : Func.timeReverse(v.expired - new Date() * 1)}\n`
                  capt += `│ Member : ${x.participants.length}\n`
                  capt += `│ Status : ${(v.mute ? 'OFF' : 'ON')}\n`
                  capt += `└ Last Activity : ${moment(v.activity).format('DD/MM/YY HH:mm:ss')}\n\n`
               })
               capt += config.options.wm
               m.reply(capt)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break

         /** AI menu */
         case 'ai':
         case 'openai':
         case 'chatgpt': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon bot`)
               m.react('🕒')
               var json = await Api.get('api/openai', {
                  prompt: m.text
               })
               if (!json.status) return m.reply(Func.Format(json))
               m.reply(json.data.content)
            } catch (e) {
               m.reply(format(e))
            }
         }
         break
         case 'article': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} hujan | Indonesia`)
               let [teks, iso] = m.text.split` | `
               m.react('🕒')
               let json = await Api.get('api/ai-article', {
                  text: teks, lang: iso
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.content)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'gemini':
         case 'bard': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon bot`)
               m.react('🕒')
               if (/image\/(jpe?g|png)/.test(quoted.mime)) {
                  let res = await Scraper.uploader(await quoted.download())
                  var json = await Api.get('api/func-chat', {
                     model: 'gemini',
                     system: m.text,
                     image: res.data.url
                  })
                  if (!respon.status) return m.reply(format(respon))
                  m.reply(json.data.content)

               } else if (m.text) {
                  var json = await Api.get('api/ai-gemini', {
                     q: m.text
                  })
                  if (!json.status) return m.reply(format(json))
                  m.reply(json.data.content)
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'blackbox': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon bot`)
               m.react('🕒')
               if (/image\/(jpe?g|png)/.test(quoted.mime)) {
                  let res = await Scraper.uploader(await quoted.download())
                  var json = await Api.get('api/func-chat', {
                     model: 'blackbox',
                     system: m.text,
                     image: res.data.url
                  })
                  if (!respon.status) return m.reply(format(respon))
                  m.reply(json.data.content)

               } else if (m.text) {
                  var json = await Api.post('api/ai-blackbox', {
                     messages: JSON.stringify([{ id: "6D0t86e", role: "system", content: "Be a helpful assistant" }, { id: "6D0t86e", role: "user", content: `${m.text}` }])
                  })
                  if (!json.status) return m.reply(format(json))
                  m.reply(json.data.content)
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'claude': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon bot`)
               m.react('🕒')
               var result = await Api.get('api/duckduckgo', {
                  msg: text,
                  model: 'claude-3-haiku-20240307'
               })
               if (!result.status) return m.reply(format(json))
               m.reply(result.data.content)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'code': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} How to create delay function | js`)
               let [code, act] = m.text.split` | `
               m.react('🕒')
               const json = await Api.get('api/ai-code', {
                  text: code, action: act
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.code)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'copilot': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} kucing`)
               m.react('🕒')
               const json = await Api.get('api/ai-copilot', {
                  q: m.text
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.content)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'stablediffusion':
         case 'stablediff':
         case 'diffusion': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} anime girl`)
               m.react('🕒')
               let json = await Api.get('api/diffusion', {
                  prompt: m.text
               })
               if (!json.status) return m.reply(format(json))
               for (let i = 0; i < 3; i++) {
                  let rand = Math.floor(json.data.length * Math.random())
                  m.reply(json.data[rand].cover, {
                     caption: `${json.data[rand].prompt}`,
                     fileName: Func.uuid(10) + '.jpg', mimetype: 'image/jpeg'
                  })
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'dokter': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} sakit kepala`)
               m.react('🕒')
               let json = await Api.get('api/ai-dokter', {
                  text: m.text
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.content)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'mathsolver': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} 1 + 1`)
               m.react('🕒')
               let json = await Api.get('api/ai-mathsolver', {
                  text: m.text
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.answe)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'meta': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} 1 + 1`)
               m.react('🕒')
               let json = await Api.get('api/ai-meta', {
                  prompt: m.text
               })
               if (!json.status) return m.reply(format(json))
               if (json.data.imagine_media.length != 0) {
                  json.data.imagine_media.map(async v => {
                     await m.reply(v.uri, {
                        caption: config.options.wm
                     })
                     await Func.sleep(1500)
                  })
               } else {
                  m.reply(json.data.content)
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'qwen': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} mark itu orang atau alien`)
               m.react('🕒')
               let json = await Api.get('api/qwen', {
                  msg: m.text,
                  model: 'qwen-max-latest',
                  realtime: false
               })
               if (!json.status) return m.reply(format(json))
               m.reply(result.data.choices[0].message.content)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break

         /** voice menu */
         case 'bass': case 'blown': case 'deep': case 'earrape': case 'fast': case 'fat': case 'nightcore': case 'reverse': case 'robot': case 'slow': case 'smooth': case 'tupai': {
            try {
               let set
               if (/bass/.test(command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20'
               if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log'
               if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3'
               if (/earrape/.test(command)) set = '-af volume=12'
               if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"'
               if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"'
               if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25'
               if (/reverse/.test(command)) set = '-filter_complex "areverse"'
               if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'
               if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"'
               if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"'
               if (/tupai/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"'
               if (/audio/.test(mime)) {
                  m.react('🕒')
                  let media = await conn.downloadAndSaveMediaMessage(quoted)
                  let ran = Func.getRandom('.mp3')
                  exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
                     fs.unlinkSync(media)
                     if (err) return m.reply(err)
                     let buff = fs.readFileSync(ran)
                     m.reply(buff, { fileName: 'vn.mp3', mimetype: 'audio/mpeg' })
                     fs.unlinkSync(ran)
                  })
               } else {
                  m.reply(`Balas audio yang ingin diubah dengan caption *${prefix + command}*`)
               }
            } catch (e) {
               console.log(e)
            }
         }
         break

         /** fun menu */
         case 'apakah': {
            if (!m.text) return m.reply('Apa yang ingin kamu tanyakan?')
            let jawab = ['Ya', 'Mungkin iya', 'Mungkin', 'Mungkin tidak', 'Tidak', 'Tidak mungkin', 'Kurang tau', 'kayaknya iya', 'Mungkin sih', 'Sepertinya iya', 'Sepertinya tidak', 'mustahil', 'hooh', 'iyoooo', 'gak tau saya']
            let json = Func.random(jawab)
            m.reply(json)
         }
         break
         case 'kapankah': {
            if (!m.text) return m.reply('Apa yang ingin kamu tanyakan?')
            let jawab = ['detik', 'menit', 'jam', 'hari', 'minggu', 'bulan', 'tahun', 'dekade', 'abad']
            let json = Func.random(jawab)
            m.reply(`${Math.floor(Math.random() * 10)} ${json} lagi ...`)
         }
         break
         case 'rate': {
            if (!m.text) return m.reply('Apa yang ingin kamu rate?')
            const ra = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100']
            const json = Func.random(ra)
            m.reply(`${text} ${json}%`)
         }
         break
         case 'siapakah': {
            if (!m.text) return m.reply('Apa yang ingin kamu tanyakan?')
            if (!m.isGroup) return m.reply('group')
            let who
            if (!m.isGroup) {
               let member = [m.sender, conn.user.jid]
               who = member[Math.floor(Math.random() * member.length)]
            } else {
               let member = participants.map((u) => u.id)
               who = member[Math.floor(Math.random() * member.length)]
            }
            m.reply(`@${who.split`@`[0]}`)
         }
         break
         case 'benarkah': {
            if (!m.text) return m.reply('Apanya yang benar?')
            let jawab = ['Iya', 'Sudah pasti', 'Sudah pasti benar', 'Tidak', 'Tentu tidak', 'Sudah pasti tidak']
            const json = Func.random(jawab)
            m.reply(json)
         }
         break
         case 'bisakah': {
            if (!m.text) return m.reply('Apanya yang bisa?')
            let jawab = ['Iya', 'Bisa', 'Tentu saja bisa', 'Tentu bisa', 'Sudah pasti', 'Sudah pasti bisa', 'Tidak', 'Tidak bisa', 'Tentu tidak', 'tentu tidak bisa', 'Sudah pasti tidak']
            const json = Func.random(jawab)
            m.reply(json)
         }
         break

         /** downloader menu */
         case 'tiktok':
         case 'tikwm':
         case 'tikmp3':
         case 'tt': {
            if (!/https?:\/\/(www\.|v(t|m|vt)\.|t\.)?tiktok\.com/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
            await m.react('🕒')
            var json = await Api.get('api/tiktok', {
               url: Func.isUrl(m.text)[0]
            })
            if (!json.status) return m.reply(Func.Format(json))
            if (command == 'tiktok' || command == 'tt') {
               let result = json.data.find(v => v.type == 'nowatermark')
               if (!result) {
                  json.data.map(x => {
                     m.reply(x.url, {
                        caption: `${json.author.nickname}\n\n${json.title}`
                     })
                  })
               } else {
                  m.reply(result.url, {
                     caption: `${json.author.nickname}\n\n${json.title}`
                  })
               }
            } else if (command == 'tikwm') return m.reply(json.data.find(v => v.type == 'watermark').url, {
               caption: `${json.author.nickname}\n\n${json.title}`
            })
            else if (command == 'tikmp3') return m.reply(json.music_info.url)
         }
         break
         case 'fb':
         case 'fbdl':
         case 'facebook': {
            if (!/https?:\/\/(fb\.watch|(www\.|web\.|m\.)?facebook\.com)/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://www.facebook.com/watch/?v=2018727118289093`)
            await m.react('🕒')
            var json = await Api.get('api/fb', {
               url: Func.isUrl(m.text)[0]
            })
            if (!json.status) return m.reply(Func.Format(json))
            let result = json.data.find(v => v.quality == 'HD') || json.data.find(v => v.quality == 'SD')
            m.reply(result.url, { caption: `${result.quality}` })
         }
         break
         case 'ig':
         case 'igdl':
         case 'instagram': {
            if (!/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://www.instagram.com/p/CITVsRYnE9h/`)
            await m.react('🕒')
            var json = await Api.get('api/ig', {
               url: Func.isUrl(m.text)[0]
            })
            if (!json.status) return m.reply(Func.Format(json))
            for (let v of json.data) {
               m.reply(v.url, { caption: config.options.wm })
            }
         }
         break
         case 'twit':
         case 'twt':
         case 'twitter': {
            if (!/https?:\/\/(www\.)?(twitter|X)\.com\/.*\/status/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://twitter.com/jokowi/status/1687008875864846336?s=20`)
            await m.react('🕒')
            var json = await Api.get('api/twitter', {
               url: Func.isUrl(m.text)[0]
            })
            if (!json.status) return m.reply(Func.Format(json))
            for (let v of json.data) {
               m.reply(v.url, { caption: config.options.wm })
            }
         }
         break
         case 'threads':
         case 'thread':
         case 'threadsdl': {
            if (!/https?:\/\/(www\.)?(threads)\.net/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://www.threads.net/t/CuiXbGvPyJz/?igshid=NTc4MTIwNjQ2YQ==`)
            await m.react('🕒')
            var json = await Api.get('api/threads', {
               url: Func.isUrl(m.text)[0]
            })
            if (!json.status) return m.reply(Func.Format(json))
            for (let v of json.data) {
               m.reply(v.url, { caption: config.options.wm })
            }
         }
         break
         case 'igstory':
         case 'igs':
         case 'instagramstory': {
            if (!m.text) return m.reply(`Example : ${prefix + command} bulansutena`)
            await m.react('🕒')
            let old = new Date()
            var json = await Api.get('api/igs', {
               q: m.text
            })
            if (!json.status) return m.reply(Func.Format(json))
            json.data.map(async (v, i) => {
               m.reply(v.url, { caption: config.options.wm })
               await Func.delay(1500)
            })
         }
         break
         case 'play':
         case 'lagu':
         case 'music': {
            if (!m.text) return m.reply(`Example : ${prefix + command} hapus aku`)
            await m.react('🕒')
            let ys = await (await yts(m.text)).all
            var yt = ys.filter(p => p.type == 'video')
            var json = await Api.get('api/yta', {
               url: yt[0].url
            })
            if (!json.status) return m.reply(Func.Format(json))
            let cap = '*Youtube Play*\n\n'
            cap += `⎔ *Title* : ${json.title}\n`
            cap += `⎔ *Size* : ${json.data.size}\n`
            cap += `⎔ *Duration* : ${json.duration}\n`
            cap += `⎔ *Quality* : ${json.data.quality}\n\n`
            cap += config.options.wm
            conn.sendMessageModify(m.from, cap, m, {
               largeThumb: true,
               thumbnail: json.thumbnail
            }).then(() => {
               m.reply(json.data.url, { fileName: json.data.filename, mimetype: 'audio/mpeg' })
            })
         }
         break
         case 'yta':
         case 'ytmp3': {
            if (!/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?(?:music\.)?youtube\.com\/(?:watch|v|embed|shorts))/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://youtu.be/_EYbfKMTpRs`)
            await m.react('🕒')
            var json = await Api.get('api/yta', {
               url: Func.isUrl(m.text)
            })
            if (!json.status) return m.reply(Func.Format(json))
            let cap = `◦ Title : ${json.title}\n`
            cap += `◦ Size : ${json.data.size}\n`
            cap += `◦ Duration : ${json.duration}\n`
            cap += `◦ Quality : ${json.data.quality}`
            conn.sendMessageModify(m.from, cap, m, {
               largeThumb: true,
               thumbnail: json.thumbnail
            }).then(() => {
               m.reply(json.data.url, { fileName: json.data.filename, mimetype: 'audio/mpeg' })
            })
         }
         break
         case 'ytv':
         case 'ytmp4': {
            if (!/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?(?:music\.)?youtube\.com\/(?:watch|v|embed|shorts))/i.test(m.text)) return m.reply(`Example : ${prefix + command} https://youtu.be/_EYbfKMTpRs`)
            await m.react('🕒')
            var json = await Api.get('api/yta', {
               url: Func.isUrl(m.text)
            })
            if (!json.status) return m.reply(Func.Format(json))
            let cap = `◦ Title : ${json.title}\n`
            cap += `◦ Size : ${json.data.size}\n`
            cap += `◦ Duration : ${json.duration}\n`
            cap += `◦ Quality : ${json.data.quality}`
            m.reply(json.data.url, { caption: cap, fileName: json.data.filename, mimetype: 'video/mp4' })
         }
         break

         /** internet menu */
         case 'ytsearch':
         case 'yts': {
            if (!m.text) return m.reply(`Example : ${prefix + command} Tasya Rosmala`)
            m.react('🕒')
            let yt = await (await yts(m.text)).all
            if (yt.length == 0) return m.reply(Func.Format(yt))
            let cap = 'Youtube Search\n\n'
            yt.map((v, i) => {
               if (1 < 15) {
                  cap += `*` + (i + 1) + `*. ` + v.title + `\n`
                  cap += `∘ Duration : ` + v.timestamp + `\n`
                  cap += `∘ Views : ` + v.views + `\n`
                  cap += `∘ Upload : ` + v.ago + `\n`
                  cap += `∘ Url : ` + v.url + `\n\n`
               }
            })
            m.reply(cap)
         }
         break
         case 'brainly': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} perang dunia ke 2 terjadi kapan`)
               m.react('🕒')
               const json = await Api.get('api/brainly', {
                  q: m.text, lang: 'id'
               })
               if (!json.status) return m.reply(format(json))
               let teks = `Brainly\n\n`
               json.data.map((v, i) => {
                  teks += `*${(i + 1)}*. ${v.question}\n`
                  teks += `›  *Answer* : \n${v.answers}\n\n`
               })
               m.reply(teks)
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'pinterest': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon`)
               m.react('🕒')
               let json = await Api.get('api/pinterest', {
                  q: m.text
               })
               if (!json.status) return m.reply(format(e))
               for (let i = 0; i < 5; i++) {
                  var rand = Math.floor(json.data.length * Math.random())
                  m.reply(json.data[rand].url, {
                     caption: config.options.wm
                  })
                  await Func.sleep(2500)
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'gimage':
         case 'google': {
            if (!m.text) return m.reply(`Example : ${prefix + command} red moon`)
            m.react('🕒')
            try {
               if (command == 'google') {
                  let json = await Api.get('api/google', {
                     q: m.text
                  })
                  let teks = `Google\n\n`
                  json.data.map((v, i) => {
                     teks += `*` + (i + 1) + `.* ` + v.title + `\n`
                     teks += `• Snippet : ` + v.snippet + `\n`
                     teks += `• Link : ` + v.url + `\n\n`
                  })
                  m.reply(teks)
               }
               if (command == 'gimage') {
                  let json = await Api.get('api/google-image', {
                     q: m.text
                  })
                  for (let i = 0; i < 5; i++) {
                     let random = Math.floor(json.data.length * Math.random())
                     let caption = `• Title : ${json.data[random].origin.title}\n`
                     caption += `• Dimensions : ${json.data[random].width} × ${json.data[random].height}`
                     m.reply(json.data[random].url, {
                        caption: caption
                     })
                     await Func.sleep(2500)
                  }
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break

         /** owner menu */
         case 'backup': {
            try {
               m.react('🕒')
               await database.read(global.db)
               fs.writeFileSync('database.json', JSON.stringify(global.db, null, 3), 'utf-8')
               await m.reply(fs.readFileSync('./database.json'), {
                  fileName: 'database.json',
                  mimetype: 'application/json'
               })
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'block': {
            if (!m.isOwner) return m.reply('owner')
            let users = m.mentions.length !== 0 ? m.mentions.slice(0, 2) : m.isQuoted ? [m.quoted.sender] : m.text.split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').slice(0, 2)
            if (users.length == 0) return m.reply('Fuck You 🖕')
            await conn.updateBlockStatus(users, 'block').then((res) => m.reply(Func.Format(res))).catch((err) => m.reply(Func.Format(err)))
         }
         break
         case 'unblock': {
            if (!m.isOwner) return m.reply('owner')
            let users = m.mentions.length !== 0 ? m.mentions.slice(0, 2) : m.isQuoted ? [m.quoted.sender] : m.text.split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').slice(0, 2)
            if (users.length == 0) return m.reply('Fuck You 🖕')
            await conn.updateBlockStatus(users, 'unblock').then((res) => m.reply(Func.Format(res))).catch((err) => m.reply(Func.Format(err)))
         }
         break
         case 'setpp': {
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
         case 'public':
         case 'autoread':
         case 'chatbot': {
            if (!m.isOwner) return m.reply('owner')
            if (!m.text) return m.reply(`Current status : [ ${global.db.setting[command.toLowerCase()] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`)
            let option = m.text.toLowerCase()
            let optionList = ['on', 'off']
            if (!optionList.includes(option)) return m.reply(`Current status : [ ${global.db.setting[command.toLowerCase()] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`)
            let status = option != 'on' ? false : true
            if (global.db.setting[command.toLowerCase()] == status) return m.reply(`${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`)
            global.db.setting[command.toLowerCase()] = status
            m.reply(`${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`)
         }
         break
         case 'setcover': {
            if (!/image\/(jpe?g|png)/.test(quoted.mime)) return m.reply(`Send or reply to images with commands ${prefix + command}`)
            m.react('🕒')
            let media = await quoted.download()
            let res = await Scraper.uploaderV2(media)
            if (!res.status) return m.reply(Func.Format(res))
            db.setting.cover = res.data.url
            m.reply('Cover successfully changed')
         }
         break
         case 'setlink': {
            if (!/^https:\/\//i.test(m.text)) return m.reply(`Example : ${prefix + command} https://wa`)
            m.react('🕒')
            db.setting.link = Func.isUrl(m.text)
            m.reply('Link successfully changed')
         }
         break
         case 'debounce':
         case 'restart': {
            if (!m.isOwner) return m.reply('owner')
            await m.reply('Restarting . . .').then(async () => {
               await database.write(global.db)
               process.send('reset')
            })
         }
         break
         case 'join': {
            try {
               if (!m.isOwner) return m.reply('owner')
               if (!m.text) return m.reply(`Example : ${prefix + command} https://chat.whatsapp.com/codeInvite`)
               let link = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
               let [_, code] = m.text.match(link) || []
               if (!code) return m.reply('Invalid URL')
               let id = await conn.groupAcceptInvite(code)
               if (!id.endsWith('g.us')) return m.reply(`Sorry i can't join to this group :(`)
               let member = await (await conn.groupMetadata(id)).participants.map(v => v.id)
               return m.reply(`Joined!`)
            } catch {
               return m.reply(`Sorry i can't join to this group :(`)
            }
         }
         break
         case '-expired':
         case '+expired': {
            try {
               if (!m.isOwner) return m.reply('owner')
               if (!m.isGroup) return m.reply('group')
               if (command == '+expired') {
                  if (!m.args[0] || isNaN(m.args[0])) return m.reply(`Example : ${prefix + command} 30`)
                  let who
                  if (m.isGroup) who = m.args[1] ? m.args[1] : m.from
                  else who = m.args[1]
                  var jumlahHari = 86400000 * m.args[0]
                  var now = new Date() * 1
                  if (now < global.db.groups[who].expired)
                     global.db.groups[who].expired += jumlahHari
                  else global.db.groups[who].expired = now + jumlahHari
                  m.reply(`Successfully set expiration days for group ${m.metadata.subject}, for ${m.args[0]} days`)
               } else if (command == '-expired') {
                  let who
                  if (m.isGroup) who = m.args[1] ? m.args[1] : m.from
                  else who = m.args[1]
                  if (new Date() * 1 < global.db.groups[who].expired)
                     global.db.groups[who].expired = undefined
                  else global.db.groups[who].expired = undefined
                  m.reply(`Successfully removed the expiration day for this Group`)
               }
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case '+premium': {
            if (m.quoted) {
               if (m.quoted.isBot) return m.reply(`🚩 Can't make the bot a premium user.`)
               if (m.args && isNaN(m.args[0])) return m.reply(`🚩 Day must be a number.`)
               let days = m.args[0] ? parseInt(m.args[0]) : 30
               let jid = conn.decodeJid(m.quoted.sender)
               let users = global.db.users[jid]
               users.expired += users.premium ? (86400000 * days) : ((new Date() * 1) + (86400000 * days))
               users.limit += 2000
               m.reply(users.premium ? `Succesfully added ${days} days premium access for @${jid.replace(/@.+/, '')}.` : `Successfully added @${jid.replace(/@.+/, '')} to premium user.`).then(() => users.premium = true)
            } else if (m.mentions.length != 0) {
               if (m.args && m.args[1] && isNaN(m.args[1])) return m.reply(`Day must be a number.`)
               let days = m.args[1] ? parseInt(m.args[1]) : 30
               let jid = conn.decodeJid(m.mentions[0])
               const users = global.db.users[jid]
               users.expired += users.premium ? (86400000 * days) : ((new Date() * 1) + (86400000 * days))
               users.limit += 2000
               conn.reply(m.chat, users.premium ? `Succesfully added ${days} days premium access for @${jid.replace(/@.+/, '')}.` : `Successfully added @${jid.replace(/@.+/, '')} to premium user.`).then(() => users.premium = true)
            } else if (m.text && /|/.test(m.text)) {
               let [number, day] = text.split`|`
               let p = (await conn.onWhatsApp(number))[0] || {}
               if (!p.exists) return m.reply('Number not registered on WhatsApp.')
               if (isNaN(day)) return m.reply(`Day must be a number.`)
               let days = day ? parseInt(day) : 30
               let jid = conn.decodeJid(p.jid)
               const users = global.db.users[jid]
               if (!users) return m.reply(`Can't find user data.`)
               users.expired += users.premium ? (86400000 * days) : ((new Date() * 1) + (86400000 * days))
               users.limit += 2000
               conn.reply(m.chat, users.premium ? `Succesfully added ${days} days premium access for @${jid.replace(/@.+/, '')}.` : `Successfully added @${jid.replace(/@.+/, '')} to premium user.`).then(() => users.premium = true)
            } else {
               let teks = `• *Example* :\n\n`
               teks += `${prefix + command} 6285xxxxx | 7\n`
               teks += `${prefix + command} @0 7\n`
               teks += `${prefix + command} 7 (reply chat target)`
               m.reply(teks)
            }
         }
         break
         case '-premium': {
            let input = m.text ? m.text : m.quoted ? m.quoted.sender : m.mentionedJid.length > 0 ? m.mentioneJid[0] : false
            if (!input) return m.reply(`Mention or reply chat target.`)
            let p = await conn.onWhatsApp(input.trim())
            if (p.length == 0) return m.reply(`Invalid number.`)
            let jid = conn.decodeJid(p[0].jid)
            let number = jid.replace(/@.+/, '')
            let data = global.db.users[jid]
            if (typeof data == 'undefined') return m.reply(`Can't find user data.`)
            if (!data.premium) return m.reply(`Not a premium account.`)
            data.premium = false
            data.expired = 0
            m.reply(`@${jid.replace(/@.+/, '')}'s premium status has been successfully deleted.`)
         }
         break
         
         /** converter menu */
         case 'sticker':
         case 's':
         case 'stiker': {
            if (/image|video|webp/i.test(quoted.mime)) {
               m.react('🕒')
               const buffer = await quoted.download()
               if (quoted?.msg?.seconds > 10) return m.reply(`Max video 9 second`)
               let exif
               if (m.text) {
                  let [packname, author] = m.text.split('|')
                  exif = {
                     packName: packname ? packname : '',
                     packPublish: author ? author : ''
                  }
               } else {
                  exif = {
                     ...config.Exif
                  }
               }
               m.reply(buffer, {
                  asSticker: true,
                  ...exif
               })
            } else if (m.mentions[0]) {
               m.react('🕒')
               let url = await conn.profilePictureUrl(m.mentions[0], 'image');
               m.reply(url, {
                  asSticker: true,
                  ...config.Exif
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/i.test(m.text)) {
               m.react('🕒')
               m.reply(Func.isUrl(m.text)[0], {
                  asSticker: true,
                  ...config.Exif
               })
            } else {
               m.reply(`Method Not Support`)
            }
         }
         break
         case 'brat': {
            try {
               const args = m.text.trim().split(' ')
               const mode = m.args[0] === 'gif' ? 'gif' : 'text'
               const content = mode === 'gif' ? args.slice(1).join(' ') : m.text.trim()
               if (!content) return m.reply(`Example : ${prefix + command} moon`)
               if (content.length > 100) return m.reply('Text is too long, max 100 characters.')
               m.react('🕒')
               if (mode === 'gif') {
                  let json = await Api.get('api/bratgif', {
                     text: content
                  })
                  m.reply(json.data.url, {
                     asSticker: true,
                     ...config.Exif
                  })
               } else {
                  let json = await Api.get('api/brat', {
                     text: content
                  })
                  m.reply(json.data.url, {
                     asSticker: true,
                     ...config.Exif
                  })
               }
            } catch (e) {
               return conn.reply(m.chat, Func.jsonFormat(e), m)
            }
         }
         break
         case 'ttp': {
            if (!m.text) return m.reply(`Example : ${prefix + command} moon`)
            if (m.text.length > 10) return m.reply(`Max 10 letters`)
            m.react('🕒')
            let json = await Api.get('api/ttp', {
               text: m.text
            })
            if (!json.status) return m.reply(format(json))
            m.reply(json.data.url, {
               asSticker: true,
               ...config.Exif
            })
         }
         break
         case 'attp': {
            if (!m.text) return m.reply(`Example : ${prefix + command} moon`)
            if (m.text.length > 10) return m.reply(`Max 10 letters`)
            m.react('🕒')
            let json = await Api.get('api/attp', {
               text: m.text
            })
            if (!json.status) return m.reply(format(json))
            m.reply(json.data.url, {
               asSticker: true,
               ...config.Exif
            })
         }
         break
         case 'emojimix': {
            if (!m.text) return m.reply(`Example : *${prefix + command} 🥵 + 🥶*`)
            m.react('🕒')
            var [emo1, emo2] = m.text.split` + `
            let json = await Api.get('api/emojimix', {
               emo1, emo2
            })
            m.reply(json.data.url, {
               asSticker: true,
               ...config.Exif
            })
         }
         break
         case 'qc':
         case 'quickchat': {
            let text = m.text
            if (!text) return m.reply(`Example : ${prefix + command} moon-bot`)
            if (text.length > 30) return m.reply(`Max 30 character.`)
            m.react('🕒')
            let pic
            try {
               pic = await conn.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image')
            } catch {
               pic = 'https://telegra.ph/file/32ffb10285e5482b19d89.jpg'
            }
            const obj = {
               "type": "quote",
               "format": "png",
               "backgroundColor": "#FFFFFF",
               "width": 512,
               "height": 768,
               "scale": 2,
               "messages": [{
                  "entities": [],
                  "avatar": true,
                  "from": {
                     "id": 1,
                     "name": m.quoted ? db.users[m.quoted.sender].name : m.pushName,
                     "photo": {
                        "url": pic
                     }
                  },
                  "text": text,
                  "replyMessage": {}
               }]
            }
            const json = await axios.post('https://bot.lyo.su/quote/generate', obj, {
               headers: {
                  'Content-Type': 'application/json'
               }
            })
            const buffer = Buffer.from(json.data.result.image, 'base64')
            m.reply(buffer, {
               asSticker: true,
               ...config.Exif
            })
         }
         break
         case 'toimg':
         case 'togif':
         case 'tovideo':
         case 'toimage': {
            let {
               webp2mp4File
            } = (await import('../sticker.js'))
            if (!/webp/i.test(quoted.mime)) return m.reply(`Reply Sticker with command ${prefix + command}`)
            if (quoted.isAnimated) {
               let media = await webp2mp4File((await quoted.download()))
               await m.reply(media)
            }
            let media = await quoted.download()
            await m.reply(media, {
               mimetype: 'image/png'
            })
         }
         break

         /** group menu */
         case 'linkgroup':
         case 'linkgrup':
         case 'linkgc': {
            if (!m.isGroup) return m.reply('group')
            //if (!m.isAdmin) return m.reply('admin')
            if (!m.isBotAdmin) return m.reply('botAdmin')
            await m.reply('https://chat.whatsapp.com/' + (await conn.groupInviteCode(m.from)))
         }
         break
         case 'afk': {
            let user = db.users[m.sender]
            user.afkTime = + new Date
            user.afkReason = m.text
            m.reply(`@${m.sender.split`@`[0]} is now AFK\n\nReason : ${user.afkReason ? user.afkReason : '-'}`)
         }
         break
         case 'del':
         case 'delete': {
            if (!quoted) return
            conn.sendMessage(m.from, {
               delete: {
                  remoteJid: m.from,
                  fromMe: m.isBotAdmin ? false : true,
                  id: quoted.id,
                  participant: quoted.sender
               }
            })
         }
         break
         case 'ava': {
            let text = m.text
            let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@`[1]) : text
            if (!text && !quoted) return m.reply(`Mention or reply chat target.`)
            if (isNaN(number)) return m.reply(`Invalid number.`)
            if (number.length > 15) return m.reply(`Invalid format.`)
            try {
               if (text) {
                  var user = number + '@s.whatsapp.net'
               } else if (m.quoted.sender) {
                  var user = m.quoted.sender
               } else if (m.mentionedJid) {
                  var user = number + '@s.whatsapp.net'
               }
            } catch (e) { } finally {
               var pic = false
               try {
                  var pic = await conn.profilePictureUrl(user, 'image')
               } catch { } finally {
                  if (!pic) return m.reply(`He/She didn't put a profile picture.`)
                  m.reply(pic)
               }
            }
         }
         break
         case 'quoted':
         case 'q': {
            const { Serialize } = (await import('../serialize.js'))
            if (!m.isQuoted) m.reply('quoted')
            try {
               const message = await Serialize(conn, (await conn.loadMessage(m.from, m.quoted.id)))
               if (!message.isQuoted) return m.reply('Quoted Not Found')
               conn.sendMessage(m.from, {
                  forward: message.quoted
               })
            } catch {
               m.reply('Quoted Not Found')
            }
         }
         break
         case 'rvo': {
            if (!m.quoted) return m.reply(`Reply view once message to use this command.`)
            if (m.quoted.message) {
               let type = Object.keys(m.quoted.message)[0]
               let q = m.quoted.message[type]
               let media = await conn.downloadAndSaveMediaMessage(q)
               if (/video/.test(type)) {
                  return await m.reply(media, { caption: q.caption || '' })
               } else if (/image/.test(type)) {
                  return await m.reply(media, { caption: q.caption || '' })
               }
            } else m.reply(`Koplak`)
         }
         break

         /** admin menu */
         case 'hidetag':
         case 'ht':
         case 'h': {
            if (!m.isGroup) return m.reply('group')
            if (!m.isAdmin) return m.reply('admin')
            let mentions = m.metadata.participants.map(a => a.id)
            let mod = await conn.cMod(m.from, quoted, /hidetag|tag|ht|h|totag/i.test(quoted.body.toLowerCase()) ? quoted.body.toLowerCase().replace(prefix + command, "") : quoted.body)
            conn.sendMessage(m.from, {
               forward: mod,
               mentions
            })
         }
         break
         case 'tagall': {
            if (!m.isGroup) return m.reply('group')
            if (!m.isAdmin) return m.reply('admin')
            let teks = `Tagall\n\n"${m.text ? m.text : 'Hi admin mention you'}"\n\n`
            for (let a of m.metadata.participants) {
               teks += `◦ @${a.id.split('@')[0]}\n`
            }
            m.reply(teks)
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
                  else m.reply(Func.Format(i))
               }
            })
         }
         break
         case 'kick': {
            if (!m.isGroup) return m.reply('group')
            if (!m.isAdmin) return m.reply('admin')
            if (!m.isBotAdmin) return m.reply('botAdmin')
            let users = m.mentions.length !== 0 ? m.mentions.slice(0, 2) : m.isQuoted ? [m.quoted.sender] : m.text.split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').slice(0, 2)
            if (users.length == 0) return m.reply('Fuck You 🖕')
            await conn.groupParticipantsUpdate(m.from, users, 'remove').then((res) => m.reply(Func.Format(res))).catch((err) => m.reply(Func.Format(err)))
         }
         break
         case 'promote': {
            if (!m.isGroup) return m.reply('group')
            if (!m.isAdmin) return m.reply('admin')
            if (!m.isBotAdmin) return m.reply('botAdmin')
            let users = m.mentions.length !== 0 ? m.mentions.slice(0, 2) : m.isQuoted ? [m.quoted.sender] : m.text.split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').slice(0, 2)
            if (users.length == 0) return m.reply('Fuck You 🖕')
            await conn.groupParticipantsUpdate(m.from, users, 'promote').then((res) => m.reply(Func.Format(res))).catch((err) => m.reply(Func.Format(err)))
         }
         break
         case 'demote': {
            if (!m.isGroup) return m.reply('group')
            if (!m.isAdmin) return m.reply('admin')
            if (!m.isBotAdmin) return m.reply('botAdmin')
            let users = m.mentions.length !== 0 ? m.mentions.slice(0, 2) : m.isQuoted ? [m.quoted.sender] : m.text.split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').slice(0, 2)
            if (users.length == 0) return m.reply('Fuck You 🖕')
            await conn.groupParticipantsUpdate(m.from, users, 'demote').then((res) => m.reply(Func.Format(res))).catch((err) => m.reply(Func.Format(err)))
         }
         break
         case 'welcome':
         case 'leaving':
         case 'detect': {
            if (!m.isAdmin) return m.reply('admin')
            if (!m.isBotAdmin && /antilink/.test(command.toLowerCase())) return m.reply('botAdmin')
            if (!m.text) return m.reply(`Current status : [ ${global.db.groups[command.toLowerCase()] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`)
            let option = m.text.toLowerCase()
            let optionList = ['on', 'off']
            if (!optionList.includes(option)) return m.reply(`Current status : [ ${global.db.groups[command.toLowerCase()] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`)
            let status = option != 'on' ? false : true
            if (global.db.groups[command.toLowerCase()] == status) return m.reply(`${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`)
            global.db.groups[command.toLowerCase()] = status
            m.reply(`${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`)
         }
         break

         /** image effect */
         case 'paretro': case 'retrolga': case 'plumy': case 'hdr': case 'sepia': case 'duotone': case 'blackwhite': case 'sketch': case 'sketchril': case 'oils': case 'esragan': case 'watercolor': case 'galaxy': case 'freplace': case 'rainbow': case 'solarize': case 'pinkbir': {
            try {
               if (!/image\/(jpe?g|png)/.test(quoted.mime)) return m.reply(`Reply or send photo use this command`)
               m.react('🕒')
               let result = await Scraper.uploader(await quoted.download())
               let json = await Api.get('api/effect', {
                  image: result.data.url, style: command.toLowerCase()
               })
               if (!json.status) return m.reply(Func.Format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break

         /** text maker */
         case 'comicbox': case 'gradientshadow': case 'lava': case 'thunder': case 'neondevil': case 'sumertimes': case 'matrix': case 'firework': case 'neonlight': case 'greenneon': case 'pokemon': case 'dragonball': case 'naruto': case 'blackpink': case 'onglass': case 'greenbrush': case 'amongus': case 'naruto2': case 'flaming': case 'woodblock': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon-bot`)
               if (m.text.length > 10) return m.reply(`Max 10 character`)
               m.react('🕒')
               var link
               if (/comicbox/.test(command)) link = 'https://textpro.me/create-online-3d-comic-book-style-text-effects-1156.html'
               if (/gradientshadow/.test(command)) link = 'https://textpro.me/create-a-gradient-text-shadow-effect-online-1141.html'
               if (/lava/.test(command)) link = 'https://textpro.me/lava-text-effect-online-914.html'
               if (/thunder/.test(command)) link = 'https://textpro.me/create-thunder-text-effect-online-881.html'
               if (/neondevil/.test(command)) link = 'https://textpro.me/create-neon-devil-wings-text-effect-online-free-1014.html'
               if (/sumertimes/.test(command)) link = 'https://textpro.me/create-a-summer-neon-light-text-effect-online-1076.html'
               if (/matrix/.test(command)) link = 'https://textpro.me/matrix-style-text-effect-online-884.html'
               if (/firework/.test(command)) link = 'https://textpro.me/firework-sparkle-text-effect-930.html'
               if (/neonlight/.test(command)) link = 'https://textpro.me/neon-light-text-effect-with-galaxy-style-981.html'
               if (/greenneon/.test(command)) link = 'https://textpro.me/green-neon-text-effect-874.html'
               if (/pokemon/.test(command)) link = 'https://textpro.me/create-pokemon-logo-style-text-effect-online-1134.html'
               /** ephoto360 */
               if (/dragonball/.test(command)) link = 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html'
               if (/naruto/.test(command)) link = 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html'
               if (/blackpink/.test(command)) link = 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html'
               if (/onglass/.test(command)) link = 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html'
               if (/greenbrush/.test(command)) link = 'https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html'
               if (/amongus/.test(command)) link = 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html'
               /** photooxy */
               if (/naruto2/.test(command)) link = 'https://photooxy.com/manga-and-anime/make-naruto-banner-online-free-378.html'
               if (/flaming/.test(command)) link = 'https://photooxy.com/logo-and-text-effects/realistic-flaming-text-effect-online-197.html'
               if (/woodblock/.test(command)) link = 'https://photooxy.com/logo-and-text-effects/carved-wood-effect-online-171.html'
               let json = await Api.get('api/textmaker', {
                  url: link, text: m.text
               })
               if (!json.status) return m.reply(Func.Format(json))
               m.reply(json.data.url_file, {
                  caption: config.options.wm
               })
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break

         /** text maker 2 */
         case 'pornhub': case 'marvelstudio': case 'marvelstudio2': case 'glitchtiktok': case 'deadpool': case '8bittext': case 'thorlogo': case 'captainamerica': case 'amongus2': {
            try {
               if (!m.text) return m.reply(`Example : ${prefix + command} moon | bot`)
               let [text1, text2] = m.text.split('|')
               if (text1.length > 10 || text2.length > 10) return m.reply('Max 10 character')
               m.react('🕒'), link
               /** text pro */
               if (/pornhub/.test(command)) link = 'https://textpro.me/generate-a-free-logo-in-pornhub-style-online-977.html'
               if (/marvelstudio/.test(command)) link = 'https://textpro.me/create-logo-style-marvel-studios-ver-metal-972.html'
               if (/marvelstudio2/.test(command)) link = 'https://textpro.me/create-logo-style-marvel-studios-online-971.html'
               if (/glitchtiktok/.test(command)) link = 'https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html'
               if (/deadpool/.test(command)) link = 'https://textpro.me/create-deadpool-logo-style-text-effect-online-1159.html'
               if (/8bittext/.test(command)) link = 'https://textpro.me/video-game-classic-8-bit-text-effect-1037.html'
               /** ephoto360 */
               if (/thorlogo/.test(command)) link = 'https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html'
               if (/captainamerica/.test(command)) link = 'https://en.ephoto360.com/create-a-cinematic-captain-america-text-effect-online-715.html'
               if (/amongus2/.test(command)) link = 'https://en.ephoto360.com/create-a-banner-game-among-us-with-your-name-763.html'
               if (/latestspace/.test(command)) link = 'https://en.ephoto360.com/latest-space-3d-text-effect-online-559.html'
               let json = await Api.get('api/textmaker2', {
                  url: link, text1, text2
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url_file, {
                  caption: config.options.wm
               })
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break

         /** tools menu */
         case 'fetch':
         case 'get': {
            if (!/^https:\/\//i.test(m.text)) return m.reply(`Example : ${prefix + command} https://api.alyachan.pro`)
            m.react('🕒')
            let mime = (await import('mime-types'))
            const res = await axios.get(Func.isUrl(m.text)[0], {
               responseType: 'arraybuffer'
            })
            if (!/utf-8|json|html|plain/.test(res?.headers?.get('content-type'))) {
               let fileName = /filename/i.test(res.headers?.get("content-disposition")) ? res.headers?.get("content-disposition")?.match(/filename=(.*)/)?.[1]?.replace(/["';]/g, '') : ''
               return m.reply(res.data, {
                  fileName,
                  mimetype: mime.lookup(fileName)
               })
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
         case 'totext':
         case 'ocr': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               const json = await Api.get('api/ocr', {
                  image: url.data.url
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.text)
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               const json = await Api.get('api/ocr', {
                  image: Func.isUrl(m.text)[0]
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.text)
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'hd':
         case 'remini': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               const json = await Api.get('api/remini', {
                  image: url.data.url
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               const json = await Api.get('api/remini', {
                  image: Func.isUrl(m.text)[0]
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'nobg':
         case 'removebg': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               const json = await Api.get('api/removebg', {
                  image: url.data.url
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               const json = await Api.get('api/removebg', {
                  image: Func.isUrl(m.text)[0]
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'toanime':
         case 'jadianime': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               const json = await Api.get('api/toanime', {
                  image: url.data.url, style: 'anime'
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               const json = await Api.get('api/toanime', {
                  image: Func.isUrl(m.text)[0], style: 'anime'
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'tozombie':
         case 'jadizombie': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               const json = await Api.get('api/tozombie', {
                  image: url.data.url
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               var json = await Api.get('api/tozombie', {
                  image: Func.isUrl(m.text)[0]
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'gta5style': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               let json = await Api.get('api/ai-photo-editor', {
                  image: url.data.url,
                  style: 'gta_5'
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               let json = await Api.get('api/ai-photo-editor', {
                  image: Func.isUrl(m.text)[0],
                  style: 'gta_5'
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'recolor': {
            if (/image/i.test(quoted.mime)) {
               m.react('🕒')
               const url = await Scraper.uploader(await quoted.download())
               var json = await Api.get('api/recolor', {
                  image: url.data.url
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg))/i.test(m.text)) {
               var json = await Api.get('api/recolor', {
                  image: Func.isUrl(m.text)[0]
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } else {
               m.reply(`Send or reply your photo...`)
            }
         }
         break
         case 'screenshot':
         case 'ss': {
            try {
               if (!m.args[1]) return m.reply(`Example : ${prefix + command} mobile https://api.alyachan.dev`)
               if (!/^https?:\/\//.test(m.args[1])) return m.reply('Prefix the link with https:// or http://')
               let mode = m.args[0].toLowerCase(), url = m.args[1]
               if (!['mobile', 'desktop'].includes(mode)) return m.reply('Use mobile or desktop mode.')
               m.react('🕒')
               const json = await Api.get('api/ssweb', {
                  url: url, mode: mode
               })
               if (!json.status) return m.reply(format(json))
               m.reply(json.data.url, {
                  caption: config.options.wm
               })
            } catch (e) {
               return m.reply(format(e))
            }
         }
         break
         case 'shortlink':
         case 'expand': {
            if (!/^https:\/\//i.test(m.text)) return m.reply(`Example : ${prefix + command} https://api.alyachan.dev`)
            m.react('🕒')
            const json = await Api.get('api/shorten', { url: Func.isUrl(m.text)[0] })
            if (!json.status) return m.reply(Func.Format(json))
            await m.reply(Func.Format(json.data.url))
         }
         break
         case 'tr':
         case 'translate': {
            let text = m.text
            if (!text) return m.reply(`No Query?\n\nExample : ${prefix + command} id What your name`)
            m.react('🕒')
            if (text && m.quoted && m.quoted.text) {
               let lang = text.slice(0, 2)
               try {
                  let data = m.quoted.text
                  let json = await Api.get('api/translate', { text: data, iso: lang })
                  m.reply(json.data.text)
               } catch (e) {
                  console.log(e)
                  m.reply(`Language code is not supported`)
               }
            } else if (text) {
               let lang = text.slice(0, 2)
               try {
                  let data = text.substring(2).trim()
                  let json = await Api.get('api/translate', { text: data, iso: lang })
                  m.reply(json.data.text)
               } catch (e) {
                  console.log(e)
                  m.reply(`Language code is not supported`)
               }
            }
         }
         break
         case 'tts': {
            let lang
            if (!m.args[0]) return m.reply(`Example : ${prefix + command} id What your name`)
            m.react('🕒')
            try {
               let text = m.args.slice(1).join('')
               if ((m.args[0] || '').length !== 2) {
                  lang = 'id'
                  text = m.args.join(' ')
               }
               if (!text && m.quoted && m.quoted.text) text = m.quoted.text
               conn.sendPresenceUpdate('recording', m.chat)
               let json = await Api.get('api/tts', {
                  text: text, iso: m.args[0]
               })
               conn.sendMedia(m.from, json.data.url, m, {
                  ptt: true
               })
            } catch (e) {
               console.log(e)
               return m.reply(`enter language code`)
            }
         }
         break
         case 'magernulis':
         case 'nulis': {
            if (!m.text) return m.reply(`Example : ${prefix + command} moon-bot wehwehweh`)
            m.react('🕒')
            let old = new Date()
            let json = await Api.get('api/nulis', {
               text: m.text
            })
            if (!json.status) return m.reply(Func.Format(json))
            m.reply(json.data.url, {
               caption: `Proccess : ${((new Date - old) * 1)} ms`
            })
         }
         break
         case 'calc':
         case 'kalk':
         case 'calculator': {
            let val = m.text
               .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
               .replace(/×/g, '*')
               .replace(/÷/g, '/')
               .replace(/π|pi/gi, 'Math.PI')
               .replace(/e/gi, 'Math.E')
               .replace(/\/+/g, '/')
               .replace(/\++/g, '+')
               .replace(/-+/g, '-')
            let format = val
               .replace(/Math\.PI/g, 'π')
               .replace(/Math\.E/g, 'e')
               .replace(/\//g, '÷')
               .replace(/\*×/g, '×')
            try {
               console.log(val)
               let result = (new Function('return ' + val))()
               if (!result) throw result
               m.reply(`*${format}* = _${result}_`)
            } catch (e) {
               if (e == undefined) return m.reply('Isinya?')
               m.reply('Format salah, hanya 0-9 dan Simbol -, +, *, /, ×, ÷, π, e, (, ) yang disupport')
            }
         }
         break

         /** end command */
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
                     if (err) return m.reply(format(err))
                     if (stdout) return m.reply(format(stdout))
                  })
               } catch (e) {
                  m.reply(format(e))
               }
            }

            /** test */
            if (/^bot/i.test(m.body) && m.isBot) {
               m.reply(`Bot Activated "${m.pushName}"`)
            }
      }
   } catch (e) {
      console.log(e)
      m.reply(format(e))
   }
   Func.reloadFile(fileURLToPath(import.meta.url))
}