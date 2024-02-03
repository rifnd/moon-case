import config from "../config.js"

export default function loadDatabase(m, conn) {
  const isNumber = x => typeof x === "number" && !isNaN(x)
  const isBoolean = x => typeof x === "boolean" && Boolean(x)

  /** users schema */
  let user = global.db.users[m.sender]
  if (typeof user !== "object") global.db.users[m.sender] = {}
  if (user) {
    if (!isNumber(user.afkTime)) user.afkTime = -1
    if (!("afkReason" in user)) user.afkReason = ""
    if (!isNumber(user.limit)) user.limit = config.limit.free
    if (!isBoolean(user.premium)) user.premium = m.isOwner ? true : false
    if (!isBoolean(user.VIP)) user.VIP = m.isOwner ? true : false
    if (!("lastChat" in user)) user.lastChat = new Date * 1
    if (!("name" in user)) user.name = m.pushName
    if (!isBoolean(user.banned)) user.banned = false
  } else {
    global.db.users[m.sender] = {
      afkTime: -1,
      afkReason: "",
      limit: config.limit.free,
      lastChat: new Date * 1,
      premium: m.isOwner ? true : false,
      VIP: m.isOwner ? true : false,
      name: m.pushName,
      banned: false,
    }
  }

  /** group schema */
  if (m.isGroup) {
    let group = global.db.groups[m.from]
    if (typeof group !== "object") global.db.groups[m.from] = {}
    if (group) {
      if (!isBoolean(group.mute)) group.mute = false
      if (!isNumber(group.lastChat)) group.lastChat = new Date * 1
      if (!isBoolean(group.welcome)) group.welcome = true
      if (!isBoolean(group.leave)) group.leave = true
    } else {
      global.db.groups[m.from] = {
        lastChat: new Date * 1,
        mute: false,
        welcome: true,
        leave: true
      }
    }
  }

  /** jid schema */
  let setting = global.db.setting
  if (setting) {
    if (!isBoolean(setting.autoread)) setting.autoread = false
    if (!("cover" in setting)) setting.cover = "https://iili.io/JAt7vf4.jpg"
    if (!("link" in setting)) setting.link = "https://chat.whatsapp.com/G57unQZ7saFIq2rdpVw0Tu"
  } else {
    global.db.setting = {
      autoread: false,
      cover: "https://iili.io/JAt7vf4.jpg",
      link: "https://chat.whatsapp.com/G57unQZ7saFIq2rdpVw0Tu"
    }
  }
  
}