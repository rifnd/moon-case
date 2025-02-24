import Func from '../function.js'
import config from '../../config.js'
import AlyaApi from '@moonr/api'
const Api = new AlyaApi()

export default async function Event(conn, m) {
   /** autoread */
   if (global.db.setting.autoread) {
      conn.sendPresenceUpdate('available', m.chat)
      conn.readMessages([m.key])
   }
   /** chat bot */
   if (!m.isGroup) {
      try {
         if (global.db.setting.chatbot && m.body && !config.options.evaluate_chars.some(v => m.body.startsWith(v))) {
            const json = await Api.post('api/completions', {
               model: 'cognitivecomputations/dolphin-2.9.1-llama-3-70b',
               messages: JSON.stringify([{ role: 'system', content: 'Be a helpful assistant' }, { role: 'user', content: `${m.body}` }])
            })
            if (!json.status) return console.log(json)
            if (!m.fromMe && !m.isGroup && json.status) return m.reply(json.data.choices[0].message.content)
         }
      } catch (e) {
         console.log(e)
      }
   }
   /** afk */
   if (m.isGroup) {
      let jids = [...new Set([...(m.mentions || []), ...(m.quoted ? [m.quoted.sender] : [])])]
      for (let jid of jids) {
         let user = global.db.users[jid]
         if (!user) continue
         let afkTime = user.afkTime
         if (!afkTime || afkTime < 0) continue
         let reason = user.afkReason || ''
         m.reply(`Jangan tag dia!\nDia sedang AFK ${reason ? 'dengan alasan ' + reason : 'tanpa alasan'} Selama ${Func.toTime(new Date - afkTime)}`)
      }
      if (global.db.users[m.sender].afkTime > -1) {
         m.reply(`Kamu berhenti AFK${global.db.users[m.sender].afkReason ? ' setelah ' + global.db.users[m.sender].afkReason : ''}\n\nSelama ${Func.toTime(new Date() - global.db.users[m.sender].afkTime)}`)
         global.db.users[m.sender].afkTime = -1
         global.db.users[m.sender].afkReason = ''
      }
   }
   /** expired premium */
   if (global.db.users[m.sender] && (new Date * 1) >= global.db.users[m.sender].expired && global.db.users[m.sender].expired != 0) {
      return m.reply('Your premium package has expired, thank you for buying and using our service.').then(async () => {
         global.db.users[m.sender].premium = false
         global.db.users[m.sender].expired = 0
         global.db.users[m.sender].limit = config.limit.free
      })
   }
   /** expired group */
   if (m.isGroup && (new Date * 1) >= global.db.groups[m.from].expired && global.db.groups[m.from].expired != 0) {
      return m.reply('Bot time has expired and will leave from this group, thank you.').then(async () => {
         global.db.groups[m.from].expired = 0
         await Func.sleep(2000).then(() => conn.groupLeave(m.from))
      })
   }
}