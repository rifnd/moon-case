const fs = require('fs')
const chalk = require('chalk')

global.set = {
  owner: ['6281252848955'],
  pairingNumber: '13655658639',
  prefa: ['😁', '😂', '🍟'],
  wm: '© moon-bot',
  footer: 'ᴍᴏᴏɴ ʙᴏᴛ ᴄᴀꜱᴇ',
  packname: 'Sticker By',
  author: 'moon whatsapp bot',
  link: '',
  thumbnail: ''
}

global.menu = {
  owner: ['>', '=>', 'public', 'self']
}

global.status = Object.freeze({
  invalid: 'Invalid url',
  wrong: 'Wrong format.',
  fail: 'Can\'t get metadata',
  error: 'Error occurred',
  errorF: 'Sorry this feature is in error.',
  premium: 'This feature only for premium user.',
  owner: 'This command only for owner.',
  group: 'This command will only work in groups.',
  botAdmin: 'This command will work when I become an admin.',
  admin: 'This command only for group admin.',
  private: 'Use this command in private chat.',
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update' ${__filename}'`))
	delete require.cache[file]
	require(file)
})