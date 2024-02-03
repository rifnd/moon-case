// setting your list menu on here
const menu = {
  admin: ['hidetag', 'add', 'welcome', 'leaving', 'setpp', 'setname', 'tagall', 'kick', 'promote', 'demote'],
  converter: ['sticker', 'toimg', 'togif', 'qc', 'ttp', 'attp', 'emojimix'],
  downloader: ['tiktok', 'tikwm', 'tikmp3', 'facebook', 'instagram', 'igstory', 'twitter', 'threads', 'play', 'ytmp3', 'ytmp4', 'capcut', 'capcutwm', 'cocofun', 'douyin', 'douyinwm', 'douyinmp3', 'likee', 'likeewm', 'pindl'],
  effect: ['paretro', 'retrolga', 'plumy', 'hdr', 'sepia', 'duotone', 'blackwhite', 'sketch', 'sketchrill', 'oils', 'esragan', 'watercolor', 'galaxy', 'freplace', 'rainbow', 'solarize', 'pinkbir'],
  fun: ['apakah', 'siapakah', 'kapankah', 'rate', 'benarkah', 'bisakah'],
  group: ['afk', 'linkgroup', 'delete', 'ava', 'quoted', 'rvo'],
  internet: ['ytsearch', 'ai', 'aiimg', 'aiarticle', 'bard', 'bing', 'bingimg', 'blackbox', 'aicode', 'gemini', 'waifudiff', 'brainly', 'pinterest', 'google', 'gimage', 'kbbg'],
  miscs: ['speed', 'owner', 'sc', 'ping', 'checkapi'],
  owner: ['eval', 'exec', 'mute', 'public', 'setpp', 'setname', 'unblock', 'block', 'setcover', 'autoread', 'setlink'],
  tools: ['remini', 'recolor', 'ocr', 'calc', 'cekresi', 'ss', 'ssweb', 'shortlink', 'translate', 'tts', 'text2img', 'transcibe', 'nulis', 'removebg', 'toanime', 'tozombie', 'turnme', 'gta5style'],
  'voice changer': ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai'],
}

const limit = {
  free: 15,
  premium: 150,
  VIP: 'Infinity',
  download: {
    free: 50000000, // use byte
    premium: 350000000, // use byte
    VIP: 1130000000, // use byte
  }
}

export default {
  limit,
  menu,

  // Set your URL and API key here
  APIs: {
    alya: 'https://api.alyachan.pro'
  },

  APIKeys: {
    'https://api.alyachan.pro': 'yourkey'
  },

  // Set Prefix, Session Name, Database Name and other options here
  options: {
    public: true,
    antiCall: true, // reject call
    database: 'database.json', // End .json when using JSON database or use Mongo URI
    owner: ['6281252848955'], // set owner number on here
    sessionName: 'session', // for name session
    prefix: /^[./!#+,]/i,
    pairingNumber: '6285786080578', // Example Input : 62xxx
    wm: 'moon-case v1.0.0',
  },

  // Set pack name sticker on here
  Exif: {
    packId: 'https://api.alyachan.pro',
    packName: `Sticker Ini Dibuat Oleh :`,
    packPublish: 'naando.io',
    packEmail: 'rifando.p.p@gmail.com',
    packWebsite: 'https://api.alyachan.pro',
    androidApp: 'https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro',
    iOSApp: 'https://apps.apple.com/id/app/muslim-pro-al-quran-adzan/id388389451?|=id',
    emojis: [],
    isAvatar: 0,
  },

  // message  response awikwok there
  msg: {
    owner: 'Features can only be accessed owner!',
    group: 'Features only accessible in group!',
    private: 'Features only accessible private chat!',
    admin: 'Features can only be accessed by group admin!',
    botAdmin: "Bot is not admin, can't use the features!",
    bot: 'Features only accessible by me',
    media: 'Reply media...',
    query: 'No Query?',
    error: 'Seems to have encountered an unexpected error, please repeat your command for a while again',
    quoted: 'Reply message...',
    wait: 'Wait a minute...',
    urlInvalid: 'Url Invalid',
    notFound: 'Result Not Found!',
    premium: 'Premium Only Features!',
    vip: 'VIP Only Features!',
    dlFree: `File over ${formatSize(limit.download.free)} can only be accessed by premium users`,
    dlPremium: `WhatsApp cannot send files larger than ${formatSize(limit.download.premium)}`,
    dlVIP: `WhatsApp cannot send files larger than ${formatSize(limit.download.VIP)}`,
  },
}

function formatSize(bytes, si = true, dp = 2) {
  const thresh = si ? 1000 : 1024
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`
  }
  const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp
  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
  return `${bytes.toFixed(dp)} ${units[u]}`
}

import { fileURLToPath } from 'url'
import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})