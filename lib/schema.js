import config from '../config.js'

export default function Schema(m, conn) {
   const isNumber = x => typeof x === 'number' && !isNaN(x)
   const isBoolean = x => typeof x === 'boolean' && Boolean(x)

   /** users schema */
   let user = global.db.users[m.sender]
   if (typeof user !== 'object') global.db.users[m.sender] = {}
   if (user) {
      if (!isNumber(user.afkTime)) user.afkTime = -1
      if (!('afkReason' in user)) user.afkReason = ''
      if (!isNumber(user.limit)) user.limit = config.limit.free
      if (!isBoolean(user.premium)) user.premium = m.isOwner ? true : false
      if (!isNumber(user.expired)) user.expired = 0
      if (!isBoolean(user.VIP)) user.VIP = m.isOwner ? true : false
      if (!('lastChat' in user)) user.lastChat = new Date * 1
      if (!('name' in user)) user.name = m.pushName
      if (!isBoolean(user.banned)) user.banned = false
   } else {
      global.db.users[m.sender] = {
         afkTime: -1,
         afkReason: '',
         limit: config.limit.free,
         lastChat: new Date * 1,
         premium: m.isOwner ? true : false,
         expired: 0,
         VIP: m.isOwner ? true : false,
         name: m.pushName,
         banned: false,
      }
   }

   /** group schema */
   if (m.isGroup) {
      let group = global.db.groups[m.from]
      if (typeof group !== 'object') global.db.groups[m.from] = {}
      if (group) {
         if (!isNumber(group.activity)) group.activity = 0
         if (!isBoolean(group.mute)) group.mute = false
         if (!('text_welcome' in group)) group.text_welcome = ''
         if (!('text_leave' in group)) group.text_leave = ''
         if (!isBoolean(group.welcome)) group.welcome = true
         if (!isBoolean(group.leave)) group.leave = true
         if (!isBoolean(group.false)) group.detect = false
         if (!isBoolean(group.antilink)) group.antilink = false
         if (!('member' in group)) group.member = {}
         if (!isNumber(group.expired)) group.expired = 0
      } else {
         global.db.groups[m.from] = {
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
   }

   /** jid schema */
   let setting = global.db.setting
   if (setting) {
      if (!isBoolean(setting.chatbot)) setting.chatbot = false
      if (!isBoolean(setting.autoread)) setting.autoread = false
      if (!isBoolean(setting.public)) setting.public = true
      if (!('cover' in setting)) setting.cover = 'https://iili.io/JAt7vf4.jpg'
      if (!('link' in setting)) setting.link = 'https://chat.whatsapp.com/G57unQZ7saFIq2rdpVw0Tu'
   } else {
      global.db.setting = {
         chatbot: false,
         autoread: false,
         public: true,
         cover: 'https://iili.io/JAt7vf4.jpg',
         link: 'https://chat.whatsapp.com/G57unQZ7saFIq2rdpVw0Tu'
      }
   }
}