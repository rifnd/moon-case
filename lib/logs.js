import chalk from 'chalk'
import moment from 'moment-timezone'
import Func from './function.js'
export default function logs(m) {
   let Z = m.fromMe ? 'Self' : m.pushName || 'No Name'
   let command = m.body.startsWith(m.prefix) ? m.command.toLowerCase() : ''
   if (m.message && !m.isBot) {
      console.log(
         command ? chalk.bold.yellow(`[ CMD ]`) : chalk.bold.whiteBright(`[ MSG ]`),
         chalk.green(moment(m.timestamp * 1000).tz(process.env.TZ || 'Asia/Jakarta').format('DD/MM/YY HH:mm:ss')),
         chalk.black.bgGreen(' ' + m.type + ' '),
         /(document|audio|sticker|image|video)/.test(m.type) ? Func.formatSize(m.msg.fileLength) : '0B',
         chalk.green.bold('from'), '[' + m.sender.split`@`[0] + ']',
         chalk.black.bgYellow(' ' + Z + ' '), 'in',
         chalk.black(chalk.green(m.isGroup ? m.metadata.subject : m.from)), '\n' +
         chalk.black(chalk.white(m.body || m.type)) + '\n'
      )
   }
}