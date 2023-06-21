process.on("uncaughtException", console.error); //Error log
require("./config");
const {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
} = require("baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const path = require("path");
const os = require("os");
const { facebook, facebook2 } = require("./lib/scrapedl.js");
const moment = require("moment-timezone");
const { JSDOM } = require("jsdom");
const Jimp = require("jimp");
const speed = require("performance-now");
const { performance } = require("perf_hooks");
const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const bochil = require("@bochilteam/scraper");
const caliph = require("caliph-api");
const {
  smsg,
  formatp,
  tanggal,
  formatDate,
  getTime,
  isUrl,
  sleep,
  clockString,
  runtime,
  fetchJson,
  getBuffer,
  jsonformat,
  format,
  parseMention,
  getRandom,
} = require("./lib/myfunc");

//Apikey
let _cmd = JSON.parse(fs.readFileSync("./database/command.json"));
let _cmdUser = JSON.parse(fs.readFileSync("./database/commandUser.json"));

// read database
let tebaklagu = (db.data.game.tebaklagu = []);
let _family100 = (db.data.game.family100 = []);
let kuismath = (db.data.game.math = []);
let tebakgambar = (db.data.game.tebakgambar = []);
let tebakkata = (db.data.game.tebakkata = []);
let caklontong = (db.data.game.lontong = []);
let caklontong_desk = (db.data.game.lontong_desk = []);
let tebakkalimat = (db.data.game.kalimat = []);
let tebaklirik = (db.data.game.lirik = []);
let tebaktebakan = (db.data.game.tebakan = []);
let vote = (db.data.others.vote = []);

module.exports = client = async (client, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId ||
          m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
          m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    var command = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    var prefix = /^[°•π÷×¶∆£¢€¥®™✓=|~`,*zxcv!?#$%^&.\/\\©^]/.test(command)
      ? command.match(/^[°•π÷×¶∆£¢€¥®™✓=|~`,*zxcv!?#$%^&.\/\\©^]/gi)
      : global.prefix;
    //var prefix = prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : prefa ?? global.prefix
    const isCmd = body.startsWith(prefix);
    //const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const isCreator = [botNumber, ...global.owner]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);
    const itsMe = m.sender == botNumber ? true : false;
    const text = (q = args.join(" "));
    const sender = m.sender;
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);

    // Group
    const groupMetadata = m.isGroup
      ? await client.groupMetadata(m.chat).catch((e) => {})
      : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupAdmins = m.isGroup
      ? await participants.filter((v) => v.admin !== null).map((v) => v.id)
      : "";
    const groupOwner = m.isGroup ? groupMetadata.owner : "";
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
    const isPremium =
      isCreator ||
      global.premium
        .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
        .includes(m.sender) ||
      false;

    try {
      let isNumber = (x) => typeof x === "number" && !isNaN(x);
      let user = global.db.data.users[m.sender];
      if (typeof user !== "object") global.db.data.users[m.sender] = {};
      if (user) {
        if (!isNumber(user.afkTime)) user.afkTime = -1;
        if (!("afkReason" in user)) user.afkReason = "";
      } else
        global.db.data.users[m.sender] = {
          afkTime: -1,
          afkReason: "",
        };

      let chats = global.db.data.chats[m.chat];
      if (typeof chats !== "object") global.db.data.chats[m.chat] = {};
      if (chats) {
        if (!("mute" in chats)) chats.mute = false;
        if (!("antilink" in chats)) chats.antilink = false;
      } else
        global.db.data.chats[m.chat] = {
          mute: false,
          antilink: false,
        };

      let setting = global.db.data.settings[botNumber];
      if (typeof setting !== "object") global.db.data.settings[botNumber] = {};
      if (setting) {
        if (!isNumber(setting.status)) setting.status = 0;
        if (!("autobio" in setting)) setting.autobio = false;
        if (!("templateImage" in setting)) setting.templateImage = true;
        if (!("templateVideo" in setting)) setting.templateVideo = false;
        if (!("templateGif" in setting)) setting.templateGif = false;
        if (!("templateMsg" in setting)) setting.templateMsg = false;
      } else
        global.db.data.settings[botNumber] = {
          status: 0,
          autobio: false,
          templateImage: true,
          templateVideo: false,
          templateGif: false,
          templateMsg: false,
        };
    } catch (err) {
      console.error(err);
    }

    // Public & Self
    if (!client.public) {
      if (!m.key.fromMe) return;
    }

    // Push Message To Console && Auto Read
    if (m.message) {
      client.readMessages([m.key]);
      console.log(
        chalk.black(chalk.bgWhite("[ PESAN ]")),
        chalk.black(chalk.bgGreen(new Date())),
        chalk.black(chalk.bgBlue(budy || m.mtype)) +
          "\n" +
          chalk.magenta("=> Dari"),
        chalk.green(pushname),
        chalk.yellow(m.sender) + "\n" + chalk.blueBright("=> Di"),
        chalk.green(m.isGroup ? pushname : "Private Chat", m.chat)
      );
    }

    // write database every 1 minute
    setInterval(() => {
      fs.writeFileSync(
        "./src/database.json",
        JSON.stringify(global.db, null, 2)
      );
    }, 60 * 1000);

    async function addCountCmd(nama, sender, _db) {
      addCountCmdUser(nama, sender, _cmdUser);
      var posi = null;
      Object.keys(_db).forEach((i) => {
        if (_db[i].nama === nama) {
          posi = i;
        }
      });
      if (posi === null) {
        _db.push({ nama: nama, count: 1 });
        fs.writeFileSync(
          "./database/command.json",
          JSON.stringify(_db, null, 2)
        );
      } else {
        _db[posi].count += 1;
        fs.writeFileSync(
          "./database/command.json",
          JSON.stringify(_db, null, 2)
        );
      }
    }

    async function addCountCmdUser(nama, sender, u) {
      var posi = null;
      var pos = null;
      Object.keys(u).forEach((i) => {
        if (u[i].jid === sender) {
          posi = i;
        }
      });
      if (posi === null) {
        u.push({ jid: sender, db: [{ nama: nama, count: 0 }] });
        fs.writeFileSync(
          "./database/commandUser.json",
          JSON.stringify(u, null, 2)
        );
        Object.keys(u).forEach((i) => {
          if (u[i].jid === sender) {
            posi = i;
          }
        });
      }
      if (posi !== null) {
        Object.keys(u[posi].db).forEach((i) => {
          if (u[posi].db[i].nama === nama) {
            pos = i;
          }
        });
        if (pos === null) {
          u[posi].db.push({ nama: nama, count: 1 });
          fs.writeFileSync(
            "./database/commandUser.json",
            JSON.stringify(u, null, 2)
          );
        } else {
          u[posi].db[pos].count += 1;
          fs.writeFileSync(
            "./database/commandUser.json",
            JSON.stringify(u, null, 2)
          );
        }
      }
    }

    async function getPosiCmdUser(sender, _db) {
      var posi = null;
      Object.keys(_db).forEach((i) => {
        if (_db[i].jid === sender) {
          posi = i;
        }
      });
      return posi;
    }

    // auto set bio
    if (db.data.settings[botNumber].autobio) {
      let setting = global.db.data.settings[botNumber];
      if (new Date() * 1 - setting.status > 1000) {
        let uptime = await runtime(process.uptime());
        await client.setStatus(
          `${client.user.name} | Runtime : ${runtime(uptime)}`
        );
        setting.status = new Date() * 1;
      }
    }

    const listmsg = (from, title, desc, list) => {
      // ngeread nya pake rowsId, jadi command nya ga keliatan
      let po = client.prepareMessageFromContent(
        from,
        {
          listMessage: {
            title: title,
            description: desc,
            buttonText: "Pilih Disini",
            footerText: "𝐻𝑒𝑟𝑚𝑎𝑛 𝐶ℎ𝑎𝑛𝑒𝑙᭄𓅂",
            listType: "SINGLE_SELECT",
            sections: list,
            quoted: mek,
          },
        },
        {}
      );
      return client.relayWAMessage(po, { waitForAck: true, quoted: mek });
    };

    // Anti Link
    if (db.data.chats[m.chat].antilink) {
      if (budy.match(`chat.whatsapp.com`)) {
        m.reply(
          `「 ANTI LINK 」\n\nKamu terdeteksi mengirim link group, maaf kamu akan di kick !`
        );
        if (!isBotAdmins) return m.reply(`Ehh bot gak admin T_T`);
        let gclink =
          `https://chat.whatsapp.com/` + (await client.groupInviteCode(m.chat));
        let isLinkThisGc = new RegExp(gclink, "i");
        let isgclink = isLinkThisGc.test(m.text);
        if (isgclink)
          return m.reply(
            `Ehh maaf gak jadi, karena kamu ngirim link group ini`
          );
        if (isAdmins) return m.reply(`Ehh maaf kamu admin`);
        if (isCreator) return m.reply(`Ehh maaf kamu owner bot ku`);
        client.groupParticipantsUpdate(m.chat, [m.sender], "remove");
      }
    }

    // Mute Chat
    if (db.data.chats[m.chat].mute && !isAdmins && !isCreator) {
      return;
    }

    // Respon Cmd with media
    if (
      isMedia &&
      m.msg.fileSha256 &&
      m.msg.fileSha256.toString("base64") in global.db.data.sticker
    ) {
      let hash = global.db.data.sticker[m.msg.fileSha256.toString("base64")];
      let { text, mentionedJid } = hash;
      let messages = await generateWAMessage(
        m.chat,
        { text: text, mentions: mentionedJid },
        {
          userJid: client.user.id,
          quoted: m.quoted && m.quoted.fakeObj,
        }
      );
      messages.key.fromMe = areJidsSameUser(m.sender, client.user.id);
      messages.key.id = m.key.id;
      messages.pushName = m.pushName;
      if (m.isGroup) messages.participant = m.sender;
      let msg = {
        ...chatUpdate,
        messages: [proto.WebMessageInfo.fromObject(messages)],
        type: "append",
      };
      client.ev.emit("messages.upsert", msg);
    }

    let mentionUser = [
      ...new Set([
        ...(m.mentionedJid || []),
        ...(m.quoted ? [m.quoted.sender] : []),
      ]),
    ];
    for (let jid of mentionUser) {
      let user = global.db.data.users[jid];
      if (!user) continue;
      let afkTime = user.afkTime;
      if (!afkTime || afkTime < 0) continue;
      let reason = user.afkReason || "";
      m.reply(
        `
Jangan tag dia!
Dia sedang AFK ${reason ? "dengan alasan " + reason : "tanpa alasan"}
Selama ${clockString(new Date() - afkTime)}
`.trim()
      );
    }

    if (db.data.users[m.sender].afkTime > -1) {
      let user = global.db.data.users[m.sender];
      m.reply(
        `
Kamu berhenti AFK${user.afkReason ? " setelah " + user.afkReason : ""}
Selama ${clockString(new Date() - user.afkTime)}
`.trim()
      );
      user.afkTime = -1;
      user.afkReason = "";
    }

    switch (command) {
      case prefix + "afk":
        {
          let user = global.db.data.users[m.sender];
          user.afkTime = +new Date();
          user.afkReason = text;
          m.reply(`${m.pushName} Telah Afk${text ? ": " + text : ""}`);
        }
        break;
      case prefix + "donasi":
      case prefix + "sewabot":
      case prefix + "sewa":
      case prefix + "buypremium":
      case prefix + "donate":
        {
          tbs = `*Hai Kak ${m.pushName}*\n\n Bot Rental Prices\n${sp} 15k Per Group via E-Walet 1 Month\n${sp} 20k via pulsa 1 Month\n\n Premium Price Bot\n${sp} 10k per User 1 bulan\n\nPayment can be via Paypal/link aja/pulsa\n\nFor more details, you can chat with the owner\nhttps://wa.me/6281252848955 (Owner)\n\nDonate For Me : \n\n${sp} Paypal : https://www.paypal.me/Rifando35\n${sp} Saweria : https://saweria.co/Nando35`;
          client.sendMessageModify(m.chat, tbs, m, {
            thumbnail: "https://telegra.ph/file/f8d35118f27c5b371da2b.jpg",
            thumbnailUrl: "https://telegra.ph/file/f8d35118f27c5b371da2b.jpg",
          });
          //client.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/f8d35118f27c5b371da2b.jpg' }, caption: `*Hai Kak ${m.pushName}*\n\n Bot Rental Prices\n${sp} 15k Per Group via E-Walet 1 Month\n${sp} 20k via pulsa 1 Month\n\n Premium Price Bot\n${sp} 10k per User 1 bulan\n\nPayment can be via Paypal/link aja/pulsa\n\nFor more details, you can chat with the owner\nhttps://wa.me/6281252848955 (Owner)\n\nDonate For Me : \n\n${sp} Paypal : https://www.paypal.me/Rifando35\n${sp} Saweria : https://saweria.co/Nando35` }, { quoted: m })
        }
        break;
      case prefix + "sc":
      case prefix + "sourcecode":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          anu = `
${sp} Script : https://github.com/Nando35/Zetspublic

Jangan lupa kasih bintang.
${sp} Donate : 628125284895 (Dana / gopay)
${sp} Saweria : https://saweria.co/Nando35
${sp} Paypal : https://www.paypal.me/Rifando35

Dont Forget Donate
`;
          let btn = [
            {
              urlButton: {
                displayText: "Instagram",
                url: "https://instagram.com/naando.io",
              },
            },
          ];
          //client.send5ButImg(m.chat, anu, botname, global.sc, btn)
          client.sendMessageModify(m.chat, anu, m, {
            thumbnail: "https://telegra.ph/file/6617fe747761a938cffaa.jpg",
            thumbnailUrl: "https://telegra.ph/file/f8d35118f27c5b371da2b.jpg",
          });
        }
        break;
      case prefix + "chat":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!isCreator) throw mess.owner;
          if (!q)
            throw "Option : 1. mute\n2. unmute\n3. archive\n4. unarchive\n5. read\n6. unread\n7. delete";
          if (args[0] === "mute") {
            client
              .chatModify({ mute: "Infinity" }, m.chat, [])
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "unmute") {
            client
              .chatModify({ mute: null }, m.chat, [])
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "archive") {
            client
              .chatModify({ archive: true }, m.chat, [])
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "unarchive") {
            client
              .chatModify({ archive: false }, m.chat, [])
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "read") {
            client
              .chatModify({ markRead: true }, m.chat, [])
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "unread") {
            client
              .chatModify({ markRead: false }, m.chat, [])
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "delete") {
            client
              .chatModify(
                { clear: { message: { id: m.quoted.id, fromMe: true } } },
                m.chat,
                []
              )
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          }
        }
        break;
      case prefix + "halah":
      case prefix + "hilih":
      case prefix + "huluh":
      case prefix + "heleh":
      case prefix + "holoh":
        if (!m.quoted && !text)
          throw `Kirim/reply text dengan caption ${prefix + command}`;
        ter = command[1].toLowerCase();
        tex = m.quoted
          ? m.quoted.text
            ? m.quoted.text
            : q
            ? q
            : m.text
          : q
          ? q
          : m.text;
        m.reply(
          tex.replace(/[aiueo]/g, ter).replace(/[AIUEO]/g, ter.toUpperCase())
        );
        break;
      case prefix + "jodohku":
        {
          if (!m.isGroup) throw mess.group;
          let member = participants.map((u) => u.id);
          let me = m.sender;
          let jodoh = member[Math.floor(Math.random() * member.length)];
          let jawab = `👫Jodoh mu adalah

@${me.split("@")[0]} ❤️ @${jodoh.split("@")[0]}`;
          let ments = [me, jodoh];
          let buttons = [
            {
              buttonId: "jodohku",
              buttonText: { displayText: "Jodohku" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            jawab,
            client.user.name,
            m,
            { mentions: ments }
          );
        }
        break;
      case prefix + "jadian":
        {
          if (!m.isGroup) throw mess.group;
          let member = participants.map((u) => u.id);
          let orang = member[Math.floor(Math.random() * member.length)];
          let jodoh = member[Math.floor(Math.random() * member.length)];
          let jawab = `Ciee yang Jadian💖 Jangan lupa pajak jadiannya🐤

@${orang.split("@")[0]} ❤️ @${jodoh.split("@")[0]}`;
          let menst = [orang, jodoh];
          let buttons = [
            {
              buttonId: "jadian",
              buttonText: { displayText: "Jodohku" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            jawab,
            client.user.name,
            m,
            { mentions: menst }
          );
        }
        break;
      case prefix + "react":
        {
          if (!isCreator) throw mess.owner;
          reactionMessage = {
            react: {
              text: args[0],
              key: { remoteJid: m.chat, fromMe: true, id: quoted.id },
            },
          };
          client.sendMessage(m.chat, reactionMessage);
        }
        break;
      case prefix + "join":
        {
          if (!isCreator) throw mess.owner;
          if (!text) throw "Masukkan Link Group!";
          if (!isUrl(args[0]) && !args[0].includes("whatsapp.com"))
            throw "Link Invalid!";
          m.reply(mess.wait);
          let result = args[0].split("https://chat.whatsapp.com/")[1];
          await client
            .groupAcceptInvite(result)
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "leave":
        {
          if (!isCreator) throw mess.owner;
          await client
            .groupLeave(m.chat)
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "setexif":
        {
          if (!isCreator) throw mess.owner;
          if (!text) throw `Example : ${prefix + command} packname|author`;
          global.packname = text.split("|")[0];
          global.author = text.split("|")[1];
          m.reply(
            `Exif berhasil diubah menjadi\n\n${sp} Packname : ${global.packname}\n${sp} Author : ${global.author}`
          );
        }
        break;
      case prefix + "kick":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          let users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await client
            .groupParticipantsUpdate(m.chat, [users], "remove")
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "add":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          let users = m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await client
            .groupParticipantsUpdate(m.chat, [users], "add")
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "promote":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          let users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await client
            .groupParticipantsUpdate(m.chat, [users], "promote")
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "demote":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          let users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await client
            .groupParticipantsUpdate(m.chat, [users], "demote")
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "block":
        {
          if (!isCreator) throw mess.owner;
          let users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await client
            .updateBlockStatus(users, "block")
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "unblock":
        {
          if (!isCreator) throw mess.owner;
          let users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          await client
            .updateBlockStatus(users, "unblock")
            .then((res) => m.reply(jsonformat(res)))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "setname":
      case prefix + "setsubject":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (!text) throw "Text ?";
          await client
            .groupUpdateSubject(m.chat, text)
            .then((res) => m.reply(mess.success))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "setdesc":
      case prefix + "setdesk":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (!text) throw "Text ?";
          await client
            .groupUpdateDescription(m.chat, text)
            .then((res) => m.reply(mess.success))
            .catch((err) => m.reply(jsonformat(err)));
        }
        break;
      case prefix + "setppbot":
        {
          if (!isCreator) throw mess.owner;
          if (!quoted)
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          if (!/image/.test(mime))
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          if (/webp/.test(mime))
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          let media = await client.downloadAndSaveMediaMessage(quoted);
          await client
            .updateProfilePicture(botNumber, { url: media })
            .catch((err) => fs.unlinkSync(media));
          m.reply(mess.success);
        }
        break;
      case prefix + "setppgroup":
      case prefix + "setppgrup":
      case prefix + "setppgc":
        {
          if (!m.isGroup) throw mess.group;
          if (!isAdmins) throw mess.admin;
          if (!quoted)
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          if (!/image/.test(mime))
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          if (/webp/.test(mime))
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          let media = await client.downloadAndSaveMediaMessage(quoted);
          await client
            .updateProfilePicture(m.chat, { url: media })
            .catch((err) => fs.unlinkSync(media));
          m.reply(mess.success);
        }
        break;
      case prefix + "tagall":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          let teks = `══✪〘 *👥 Tag All* 〙✪══
 
 ➲ *Pesan : ${q ? q : "kosong"}*\n\n`;
          for (let mem of participants) {
            teks += `${sp} @${mem.id.split("@")[0]}\n`;
          }
          client.sendMessage(
            m.chat,
            { text: teks, mentions: participants.map((a) => a.id) },
            { quoted: m }
          );
        }
        break;
      case prefix + "hidetag":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          client.sendMessage(
            m.chat,
            { text: q ? q : "", mentions: participants.map((a) => a.id) },
            { quoted: m }
          );
        }
        break;
      case prefix + "style":
      case prefix + "styletext":
        {
          if (!isPremium && global.db.data.users[m.sender].limit < 1)
            return m.reply(mess.endLimit); // respon ketika limit habis
          db.data.users[m.sender].limit -= 1; // -1 limit
          let { styletext } = require("./lib/scraper");
          if (!text) throw "Masukkan Query text!";
          let anu = await styletext(text);
          let teks = `Srtle Text From ${text}\n\n`;
          for (let i of anu) {
            teks += `${sp} *${i.name}* : ${i.result}\n\n`;
          }
          m.reply(teks);
        }
        break;
      case prefix + "vote":
        {
          if (!m.isGroup) throw mess.group;
          if (m.chat in vote)
            throw `_Masih ada vote di chat ini!_\n\n*${prefix}hapusvote* - untuk menghapus vote`;
          if (!text)
            throw `Masukkan Alasan Melakukan Vote, Example: *${
              prefix + command
            } Owner Ganteng*`;
          m.reply(
            `Vote dimulai!\n\n*${prefix}upvote* - untuk ya\n*${prefix}devote* - untuk tidak\n*${prefix}cekvote* - untuk mengecek vote\n*${prefix}hapusvote* - untuk menghapus vote`
          );
          vote[m.chat] = [q, [], []];
          await sleep(1000);
          upvote = vote[m.chat][1];
          devote = vote[m.chat][2];
          teks_vote = `*「 VOTE 」*

*Alasan:* ${vote[m.chat][0]}

┌〔 UPVOTE 〕
│ 
├ Total: ${vote[m.chat][1].length}
│
│ 
└────

┌〔 DEVOTE 〕
│ 
├ Total: ${vote[m.chat][2].length}
│
│ 
└────

*${prefix}hapusvote* - untuk menghapus vote`;
          let buttonsVote = [
            {
              buttonId: `${prefix}upvote`,
              buttonText: { displayText: "𝚄𝙿𝚅𝙾𝚃𝙴" },
              type: 1,
            },
            {
              buttonId: `${prefix}devote`,
              buttonText: { displayText: "𝙳𝙴𝚅𝙾𝚃𝙴" },
              type: 1,
            },
          ];

          let buttonMessageVote = {
            text: teks_vote,
            footer: client.user.name,
            buttons: buttonsVote,
            headerType: 1,
          };
          client.sendMessage(m.chat, buttonMessageVote);
        }
        break;
      case prefix + "upvote":
        {
          if (!m.isGroup) throw mess.group;
          if (!(m.chat in vote))
            throw `_*tidak ada voting digrup ini!*_\n\n*${prefix}vote* - untuk memulai vote`;
          isVote = vote[m.chat][1].concat(vote[m.chat][2]);
          wasVote = isVote.includes(m.sender);
          if (wasVote) throw "Kamu Sudah Vote";
          vote[m.chat][1].push(m.sender);
          menvote = vote[m.chat][1].concat(vote[m.chat][2]);
          teks_vote = `*「 VOTE 」*

*Alasan:* ${vote[m.chat][0]}

┌〔 UPVOTE 〕
│ 
├ Total: ${vote[m.chat][1].length}
${vote[m.chat][1].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join("\n")}
│ 
└────

┌〔 DEVOTE 〕
│ 
├ Total: ${vote[m.chat][2].length}
${vote[m.chat][2].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join("\n")}
│ 
└────

*${prefix}hapusvote* - untuk menghapus vote`;
          let buttonsUpvote = [
            {
              buttonId: `${prefix}upvote`,
              buttonText: { displayText: "𝚄𝙿𝚅𝙾𝚃𝙴" },
              type: 1,
            },
            {
              buttonId: `${prefix}devote`,
              buttonText: { displayText: "𝙳𝙴𝚅𝙾𝚃𝙴" },
              type: 1,
            },
          ];

          let buttonMessageUpvote = {
            text: teks_vote,
            footer: client.user.name,
            buttons: buttonsUpvote,
            headerType: 1,
            mentions: menvote,
          };
          client.sendMessage(m.chat, buttonMessageUpvote);
        }
        break;
      case prefix + "devote":
        {
          if (!m.isGroup) throw mess.group;
          if (!(m.chat in vote))
            throw `_*tidak ada voting digrup ini!*_\n\n*${prefix}vote* - untuk memulai vote`;
          isVote = vote[m.chat][1].concat(vote[m.chat][2]);
          wasVote = isVote.includes(m.sender);
          if (wasVote) throw "Kamu Sudah Vote";
          vote[m.chat][2].push(m.sender);
          menvote = vote[m.chat][1].concat(vote[m.chat][2]);
          teks_vote = `*「 VOTE 」*

*Alasan:* ${vote[m.chat][0]}

┌〔 UPVOTE 〕
│ 
├ Total: ${vote[m.chat][1].length}
${vote[m.chat][1].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join("\n")}
│ 
└────

┌〔 DEVOTE 〕
│ 
├ Total: ${vote[m.chat][2].length}
${vote[m.chat][2].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join("\n")}
│ 
└────

*${prefix}hapusvote* - untuk menghapus vote`;
          let buttonsDevote = [
            {
              buttonId: `${prefix}upvote`,
              buttonText: { displayText: "𝚄𝙿𝚅𝙾𝚃𝙴" },
              type: 1,
            },
            {
              buttonId: `${prefix}devote`,
              buttonText: { displayText: "𝙳𝙴𝚅𝙾𝚃𝙴" },
              type: 1,
            },
          ];

          let buttonMessageDevote = {
            text: teks_vote,
            footer: client.user.name,
            buttons: buttonsDevote,
            headerType: 1,
            mentions: menvote,
          };
          client.sendMessage(m.chat, buttonMessageDevote);
        }
        break;

      case prefix + "cekvote":
        if (!m.isGroup) throw mess.group;
        if (!(m.chat in vote))
          throw `_*tidak ada voting digrup ini!*_\n\n*${prefix}vote* - untuk memulai vote`;
        teks_vote = `*「 VOTE 」*

*Alasan:* ${vote[m.chat][0]}

┌〔 UPVOTE 〕
│ 
├ Total: ${upvote.length}
${vote[m.chat][1].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join("\n")}
│ 
└────

┌〔 DEVOTE 〕
│ 
├ Total: ${devote.length}
${vote[m.chat][2].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join("\n")}
│ 
└────

*${prefix}hapusvote* - untuk menghapus vote


©${client.user.id}
`;
        client.sendTextWithMentions(m.chat, teks_vote, m);
        break;
      case prefix + "deletevote":
      case "delvote":
      case prefix + "hapusvote":
        {
          if (!m.isGroup) throw mess.group;
          if (!(m.chat in vote))
            throw `_*tidak ada voting digrup ini!*_\n\n*${prefix}vote* - untuk memulai vote`;
          delete vote[m.chat];
          m.reply("Berhasil Menghapus Sesi Vote Di Grup Ini");
        }
        break;
      case prefix + "group":
      case prefix + "grup":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (args[0] === "close") {
            await client
              .groupSettingUpdate(m.chat, "announcement")
              .then((res) => m.reply(`Sukses Menutup Group`))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "open") {
            await client
              .groupSettingUpdate(m.chat, "not_announcement")
              .then((res) => m.reply(`Sukses Membuka Group`))
              .catch((err) => m.reply(jsonformat(err)));
          } else {
            let buttons = [
              {
                buttonId: "group open",
                buttonText: { displayText: "Open" },
                type: 1,
              },
              {
                buttonId: "group close",
                buttonText: { displayText: "Close" },
                type: 1,
              },
            ];
            await client.sendButtonText(
              m.chat,
              buttons,
              `Mode Group`,
              client.user.name,
              m
            );
          }
        }
        break;
      case prefix + "editinfo":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (args[0] === "open") {
            await client
              .groupSettingUpdate(m.chat, "unlocked")
              .then((res) => m.reply(`Sukses Membuka Edit Info Group`))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "close") {
            await client
              .groupSettingUpdate(m.chat, "locked")
              .then((res) => m.reply(`Sukses Menutup Edit Info Group`))
              .catch((err) => m.reply(jsonformat(err)));
          } else {
            let buttons = [
              {
                buttonId: "editinfo open",
                buttonText: { displayText: "Open" },
                type: 1,
              },
              {
                buttonId: "editinfo close",
                buttonText: { displayText: "Close" },
                type: 1,
              },
            ];
            await client.sendButtonText(
              m.chat,
              buttons,
              `Mode Edit Info`,
              client.user.name,
              m
            );
          }
        }
        break;
      case prefix + "antilink":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (args[0] === "on") {
            if (db.data.chats[m.chat].antilink)
              return m.reply(`Sudah Aktif Sebelumnya`);
            db.data.chats[m.chat].antilink = true;
            m.reply(`Antilink Aktif !`);
          } else if (args[0] === "off") {
            if (!db.data.chats[m.chat].antilink)
              return m.reply(`Sudah Tidak Aktif Sebelumnya`);
            db.data.chats[m.chat].antilink = false;
            m.reply(`Antilink Tidak Aktif !`);
          } else {
            let buttons = [
              {
                buttonId: "antilink on",
                buttonText: { displayText: "On" },
                type: 1,
              },
              {
                buttonId: "antilink off",
                buttonText: { displayText: "Off" },
                type: 1,
              },
            ];
            await client.sendButtonText(
              m.chat,
              buttons,
              `Mode Antilink`,
              client.user.name,
              m
            );
          }
        }
        break;
      case prefix + "mute":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (args[0] === "on") {
            if (db.data.chats[m.chat].mute)
              return m.reply(`Sudah Aktif Sebelumnya`);
            db.data.chats[m.chat].mute = true;
            m.reply(`${client.user.name} telah di mute di group ini !`);
          } else if (args[0] === "off") {
            if (!db.data.chats[m.chat].mute)
              return m.reply(`Sudah Tidak Aktif Sebelumnya`);
            db.data.chats[m.chat].mute = false;
            m.reply(`${client.user.name} telah di unmute di group ini !`);
          } else {
            let buttons = [
              {
                buttonId: "mute on",
                buttonText: { displayText: "On" },
                type: 1,
              },
              {
                buttonId: "mute off",
                buttonText: { displayText: "Off" },
                type: 1,
              },
            ];
            await client.sendButtonText(
              m.chat,
              buttons,
              `Mute Bot`,
              client.user.name,
              m
            );
          }
        }
        break;
      case prefix + "linkgroup":
      case prefix + "linkgc":
        {
          if (!m.isGroup) throw mess.group;
          let response = await client.groupInviteCode(m.chat);
          client.sendText(
            m.chat,
            `https://chat.whatsapp.com/${response}\n\nLink Group : ${groupMetadata.subject}`,
            m,
            { detectLink: true }
          );
        }
        break;
      case prefix + "ephemeral":
        {
          if (!m.isGroup) throw mess.group;
          if (!isBotAdmins) throw mess.botAdmin;
          if (!isAdmins) throw mess.admin;
          if (!text) throw "Masukkan value enable/disable";
          if (args[0] === "enable") {
            await client
              .sendMessage(m.chat, {
                disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL,
              })
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          } else if (args[0] === "disable") {
            await client
              .sendMessage(m.chat, { disappearingMessagesInChat: false })
              .then((res) => m.reply(jsonformat(res)))
              .catch((err) => m.reply(jsonformat(err)));
          }
        }
        break;
      case prefix + "delete":
      case prefix + "del":
        {
          if (!m.quoted) throw false;
          let { chat, fromMe, id, isBaileys } = m.quoted;
          if (!isBaileys) throw "Pesan tersebut bukan dikirim oleh bot!";
          client.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: true,
              id: m.quoted.id,
              participant: m.quoted.sender,
            },
          });
        }
        break;
      case prefix + "bcgc":
      case prefix + "bcgroup":
        {
          if (!isCreator) throw mess.owner;
          if (!text)
            throw `Text mana?\n\nExample : ${prefix + command} fatih-san`;
          let getGroups = await client.groupFetchAllParticipating();
          let groups = Object.entries(getGroups)
            .slice(0)
            .map((entry) => entry[1]);
          let anu = groups.map((v) => v.id);
          m.reply(
            `Mengirim Broadcast Ke ${anu.length} Group Chat, Waktu Selesai ${
              anu.length * 1.5
            } detik`
          );
          for (let i of anu) {
            await sleep(1500);
            let btn = [
              {
                urlButton: {
                  displayText: "Source Code",
                  url: "https://github.com/DikaArdnt/client-Morou",
                },
              },
            ];
            let txt = `「 Broadcast Bot 」\n\n${text}`;
            client.send5ButImg(i, txt, client.user.name, global.thumb, btn);
          }
          m.reply(`Sukses Mengirim Broadcast Ke ${anu.length} Group`);
        }
        break;
      case prefix + "bc":
      case prefix + "broadcast":
      case prefix + "bcall":
        {
          if (!isCreator) throw mess.owner;
          if (!text)
            throw `Text mana?\n\nExample : ${prefix + command} fatih-san`;
          let anu = await store.chats.all().map((v) => v.id);
          m.reply(
            `Mengirim Broadcast Ke ${anu.length} Chat\nWaktu Selesai ${
              anu.length * 1.5
            } detik`
          );
          for (let yoi of anu) {
            await sleep(1500);
            let btn = [
              {
                urlButton: {
                  displayText: "Source Code",
                  url: "https://github.com/DikaArdnt/client-Morou",
                },
              },
            ];
            let txt = `「 Broadcast Bot 」\n\n${text}`;
            client.send5ButImg(yoi, txt, client.user.name, global.thumb, btn);
          }
          m.reply("Sukses Broadcast");
        }
        break;
      case prefix + "infochat":
        {
          if (!m.quoted) m.reply("Reply Pesan");
          let msg = await m.getQuotedObj();
          if (!m.quoted.isBaileys)
            throw "Pesan tersebut bukan dikirim oleh bot!";
          let teks = "";
          for (let i of msg.userReceipt) {
            let read = i.readTimestamp;
            let unread = i.receiptTimestamp;
            let waktu = read ? read : unread;
            teks += `${sp} @${i.userJid.split("@")[0]}\n`;
            teks += ` ┗━${sp} *Waktu :* ${moment(waktu * 1000).format(
              "DD/MM/YY HH:mm:ss"
            )} ${sp} *Status :* ${read ? "Dibaca" : "Terkirim"}\n\n`;
          }
          client.sendTextWithMentions(m.chat, teks, m);
        }
        break;
      case prefix + "q":
      case prefix + "quoted":
        {
          if (!m.quoted) return m.reply("Reply Pesannya!!");
          let wokwol = await client.serializeM(await m.getQuotedObj());
          if (!wokwol.quoted)
            return m.reply("Pesan Yang anda reply tidak mengandung reply");
          await wokwol.quoted.copyNForward(m.chat, true);
        }
        break;
      case prefix + "listpc":
        {
          let anu = await store.chats
            .all()
            .filter((v) => v.id.endsWith(".net"))
            .map((v) => v.id);
          let teks = `⬣ *LIST PERSONAL CHAT*\n\nTotal Chat : ${anu.length} Chat\n\n`;
          for (let i of anu) {
            let nama = store.messages[i].array[0].pushName;
            teks += `${sp} *Nama :* ${nama}\n${sp} *User :* @${
              i.split("@")[0]
            }\n${sp} *Chat :* https://wa.me/${
              i.split("@")[0]
            }\n\n────────────────────────\n\n`;
          }
          client.sendTextWithMentions(m.chat, teks, m);
        }
        break;
      case prefix + "listgc":
        {
          let anu = await store.chats
            .all()
            .filter((v) => v.id.endsWith("@g.us"))
            .map((v) => v.id);
          let teks = `⬣ *LIST GROUP CHAT*\n\nTotal Group : ${anu.length} Group\n\n`;
          for (let i of anu) {
            let metadata = await client.groupMetadata(i);
            teks += `${sp} *Nama :* ${metadata.subject}\n${sp} *Owner :* @${
              metadata.owner.split("@")[0]
            }\n${sp} *ID :* ${metadata.id}\n${sp} *Dibuat :* ${moment(
              metadata.creation * 1000
            )
              .tz("Asia/Jakarta")
              .format("DD/MM/YYYY HH:mm:ss")}\n${sp} *Member :* ${
              metadata.participants.length
            }\n\n────────────────────────\n\n`;
          }
          client.sendTextWithMentions(m.chat, teks, m);
        }
        break;
      case prefix + "listonline":
      case prefix + "liston":
        {
          let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat;
          let online = [...Object.keys(store.presences[id]), botNumber];
          client.sendText(
            m.chat,
            "List Online:\n\n" +
              online.map((v) => "${sp} @" + v.replace(/@.+/, "")).join`\n`,
            m,
            { mentions: online }
          );
        }
        break;
      case prefix + "sticker":
      case prefix + "s":
      case prefix + "stickergif":
      case prefix + "sgif":
        {
          if (!quoted)
            throw `Balas Video/Image Dengan Caption ${prefix + command}`;
          m.reply(mess.wait);
          if (/image/.test(mime)) {
            let media = await quoted.download();
            let encmedia = await client.sendImageAsSticker(m.chat, media, m, {
              packname: global.packname,
              author: global.author,
            });
            await fs.unlinkSync(encmedia);
          } else if (/video/.test(mime)) {
            if ((quoted.msg || quoted).seconds > 11)
              return m.reply("Maksimal 10 detik!");
            let media = await quoted.download();
            let encmedia = await client.sendVideoAsSticker(m.chat, media, m, {
              packname: global.packname,
              author: global.author,
            });
            await fs.unlinkSync(encmedia);
          } else {
            throw `Kirim Gambar/Video Dengan Caption ${
              prefix + command
            }\nDurasi Video 1-9 Detik`;
          }
        }
        break;
      case prefix + "ebinary":
        {
          if (!m.quoted.text && !text)
            throw `Kirim/reply text dengan caption ${prefix + command}`;
          let { eBinary } = require("./lib/binary");
          let teks = text
            ? text
            : m.quoted && m.quoted.text
            ? m.quoted.text
            : m.text;
          let eb = await eBinary(teks);
          m.reply(eb);
        }
        break;
      case prefix + "dbinary":
        {
          if (!m.quoted.text && !text)
            throw `Kirim/reply text dengan caption ${prefix + command}`;
          let { dBinary } = require("./lib/binary");
          let teks = text
            ? text
            : m.quoted && m.quoted.text
            ? m.quoted.text
            : m.text;
          let db = await dBinary(teks);
          m.reply(db);
        }
        break;
      case prefix + "emojimix":
        {
          if (!text) throw `Example : ${prefix + command} 😅+🤔`;
          let [emoji1, emoji2] = text.split`+`;
          let anu = await fetchJson(
            `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(
              emoji1
            )}_${encodeURIComponent(emoji2)}`
          );
          for (let res of anu.results) {
            let encmedia = await client.sendImageAsSticker(m.chat, res.url, m, {
              packname: global.packname,
              author: global.author,
              categories: res.tags,
            });
            await fs.unlinkSync(encmedia);
          }
        }
        break;
      case prefix + "toimage":
      case prefix + "toimg":
        {
          if (!quoted) throw "Reply Image";
          if (!/webp/.test(mime))
            throw `balas stiker dengan caption *${prefix + command}*`;
          m.reply(mess.wait);
          let media = await client.downloadAndSaveMediaMessage(quoted);
          let ran = await getRandom(".png");
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media);
            if (err) throw err;
            let buffer = fs.readFileSync(ran);
            client.sendMessage(m.chat, { image: buffer }, { quoted: m });
            fs.unlinkSync(ran);
          });
        }
        break;
      case prefix + "tomp4":
      case prefix + "tovideo":
        {
          if (!quoted) throw "Reply Image";
          if (!/webp/.test(mime))
            throw `balas stiker dengan caption *${prefix + command}*`;
          m.reply(mess.wait);
          let { webp2mp4File } = require("./lib/uploader");
          let media = await client.downloadAndSaveMediaMessage(quoted);
          let webpToMp4 = await webp2mp4File(media);
          await client.sendMessage(
            m.chat,
            {
              video: {
                url: webpToMp4.result,
                caption: "Convert Webp To Video",
              },
            },
            { quoted: m }
          );
          await fs.unlinkSync(media);
        }
        break;
      case prefix + "toaud":
      case prefix + "toaudio":
        {
          if (!/video/.test(mime) && !/audio/.test(mime))
            throw `Kirim/Reply Video/Audio Yang Ingin Dijadikan Audio Dengan Caption ${
              prefix + command
            }`;
          if (!quoted)
            throw `Kirim/Reply Video/Audio Yang Ingin Dijadikan Audio Dengan Caption ${
              prefix + command
            }`;
          m.reply(mess.wait);
          let media = await quoted.download();
          let { toAudio } = require("./lib/converter");
          let audio = await toAudio(media, "mp4");
          client.sendMessage(
            m.chat,
            { audio: audio, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        }
        break;
      case prefix + "tomp3":
        {
          if (/document/.test(mime))
            throw `Kirim/Reply Video/Audio Yang Ingin Dijadikan MP3 Dengan Caption ${
              prefix + command
            }`;
          if (!/video/.test(mime) && !/audio/.test(mime))
            throw `Kirim/Reply Video/Audio Yang Ingin Dijadikan MP3 Dengan Caption ${
              prefix + command
            }`;
          if (!quoted)
            throw `Kirim/Reply Video/Audio Yang Ingin Dijadikan MP3 Dengan Caption ${
              prefix + command
            }`;
          m.reply(mess.wait);
          let media = await quoted.download();
          let { toAudio } = require("./lib/converter");
          let audio = await toAudio(media, "mp4");
          client.sendMessage(
            m.chat,
            {
              document: audio,
              mimetype: "audio/mpeg",
              fileName: `Convert By ${client.user.name}.mp3`,
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "tovn":
      case prefix + "toptt":
        {
          if (!/video/.test(mime) && !/audio/.test(mime))
            throw `Reply Video/Audio Yang Ingin Dijadikan VN Dengan Caption ${
              prefix + command
            }`;
          if (!quoted)
            throw `Reply Video/Audio Yang Ingin Dijadikan VN Dengan Caption ${
              prefix + command
            }`;
          m.reply(mess.wait);
          let media = await quoted.download();
          let { toPTT } = require("./lib/converter");
          let audio = await toPTT(media, "mp4");
          client.sendMessage(
            m.chat,
            { audio: audio, mimetype: "audio/mpeg", ptt: true },
            { quoted: m }
          );
        }
        break;
      case prefix + "togif":
        {
          if (!quoted) throw "Reply Image";
          if (!/webp/.test(mime))
            throw `balas stiker dengan caption *${prefix + command}*`;
          m.reply(mess.wait);
          let { webp2mp4File } = require("./lib/uploader");
          let media = await client.downloadAndSaveMediaMessage(quoted);
          let webpToMp4 = await webp2mp4File(media);
          await client.sendMessage(
            m.chat,
            {
              video: {
                url: webpToMp4.result,
                caption: "Convert Webp To Video",
              },
              gifPlayback: true,
            },
            { quoted: m }
          );
          await fs.unlinkSync(media);
        }
        break;
      case prefix + "tourl":
        {
          m.reply(mess.wait);
          let {
            UploadFileUgu,
            webp2mp4File,
            TelegraPh,
          } = require("./lib/uploader");
          let media = await client.downloadAndSaveMediaMessage(quoted);
          if (/image/.test(mime)) {
            let anu = await TelegraPh(media);
            m.reply(util.format(anu));
          } else if (!/image/.test(mime)) {
            let anu = await UploadFileUgu(media);
            m.reply(util.format(anu));
          }
          await fs.unlinkSync(media);
        }
        break;
      case prefix + "imagenobg":
      case prefix + "removebg":
      case prefix + "remove-bg":
        {
          if (!quoted)
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          if (!/image/.test(mime))
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          if (/webp/.test(mime))
            throw `Kirim/Reply Image Dengan Caption ${prefix + command}`;
          let remobg = require("remove.bg");
          let apirnobg = [
            "q61faXzzR5zNU6cvcrwtUkRU",
            "S258diZhcuFJooAtHTaPEn4T",
            "5LjfCVAp4vVNYiTjq9mXJWHF",
            "aT7ibfUsGSwFyjaPZ9eoJc61",
            "BY63t7Vx2tS68YZFY6AJ4HHF",
            "5Gdq1sSWSeyZzPMHqz7ENfi8",
            "86h6d6u4AXrst4BVMD9dzdGZ",
            "xp8pSDavAgfE5XScqXo9UKHF",
            "dWbCoCb3TacCP93imNEcPxcL",
          ];
          let apinobg = apirnobg[Math.floor(Math.random() * apirnobg.length)];
          hmm = (await "./src/remobg-") + getRandom("");
          localFile = await client.downloadAndSaveMediaMessage(quoted, hmm);
          outputFile = (await "./src/hremo-") + getRandom(".png");
          m.reply(mess.wait);
          remobg
            .removeBackgroundFromImageFile({
              path: localFile,
              apiKey: apinobg,
              size: "regular",
              type: "auto",
              scale: "100%",
              outputFile,
            })
            .then(async (result) => {
              client.sendMessage(
                m.chat,
                { image: fs.readFileSync(outputFile), caption: mess.success },
                { quoted: m }
              );
              await fs.unlinkSync(localFile);
              await fs.unlinkSync(outputFile);
            });
        }
        break;
      case prefix + "yts":
      case prefix + "ytsearch":
        {
          if (!text) throw `Example : ${prefix + command} story wa anime`;
          let yts = require("yt-search");
          let search = await yts(text);
          let teks = "YouTube Search\n\n Result From " + text + "\n\n";
          let no = 1;
          for (let i of search.all) {
            teks += `⭔ No : ${no++}\n⭔ Type : ${i.type}\n⭔ Video ID : ${
              i.videoId
            }\n⭔ Title : ${i.title}\n⭔ Views : ${i.views}\n⭔ Duration : ${
              i.timestamp
            }\n⭔ Upload At : ${i.ago}\n⭔ Author : ${i.author.name}\n⭔ Url : ${
              i.url
            }\n\n─────────────────\n\n`;
          }
          client.sendMessage(
            m.chat,
            { image: { url: search.all[0].thumbnail }, caption: teks },
            { quoted: m }
          );
        }
        break;
      case prefix + "google":
        {
          if (!text) throw `Example : ${prefix + command} fatih arridho`;
          let google = require("google-it");
          google({ query: text }).then((res) => {
            let teks = `Google Search From : ${text}\n\n`;
            for (let g of res) {
              teks += `${sp} *Title* : ${g.title}\n`;
              teks += `${sp} *Description* : ${g.snippet}\n`;
              teks += `${sp} *Link* : ${g.link}\n\n────────────────────────\n\n`;
            }
            m.reply(teks);
          });
        }
        break;
      case prefix + "gimage":
        {
          if (!text) throw `Example : ${prefix + command} kaori cicak`;
          let gis = require("g-i-s");
          gis(text, async (error, result) => {
            n = result;
            images = n[Math.floor(Math.random() * n.length)].url;
            let buttons = [
              {
                buttonId: `gimage ${text}`,
                buttonText: { displayText: "Next Image" },
                type: 1,
              },
            ];
            let buttonMessage = {
              image: { url: images },
              caption: `*-------「 GIMAGE SEARCH 」-------*
🤠 *Query* : ${text}
🔗 *Media Url* : ${images}`,
              footer: client.user.name,
              buttons: buttons,
              headerType: 4,
            };
            client.sendMessage(m.chat, buttonMessage, { quoted: m });
          });
        }
        break;
      case prefix + "dashboard":
        addCountCmd("#dashboard", sender, _cmd);
        var posi = await getPosiCmdUser(sender, _cmdUser);
        _cmdUser[posi].db.sort((a, b) => (a.count < b.count ? 1 : -1));
        _cmd.sort((a, b) => (a.count < b.count ? 1 : -1));
        var posi = await getPosiCmdUser(sender, _cmdUser);
        var jumlahCmd = _cmd.length;
        if (jumlahCmd > 10) jumlahCmd = 10;
        var jumlah = _cmdUser[posi].db.length;
        if (jumlah > 5) jumlah = 5;
        var totalUser = 0;
        for (let x of _cmdUser[posi].db) {
          totalUser = totalUser + x.count;
        }
        var total = 0;
        for (let o of _cmd) {
          total = total + o.count;
        }
        var teks = `*client BOT DASHBOARD*\n\n*HIT*\n• GLOBAL : ${total}\n• USER : ${totalUser}\n\n`;
        teks += `*Most Command Global*\n`;
        for (let u = 0; u < jumlahCmd; u++) {
          teks += `• ${_cmd[u].nama} : ${_cmd[u].count}\n`;
        }
        teks += `\n*Most Command User*\n`;
        for (let i = 0; i < jumlah; i++) {
          teks += `• ${_cmdUser[posi].db[i].nama} : ${_cmdUser[posi].db[i].count}\n`;
        }
        m.reply(teks);
        break;
      case prefix + "play":
      case prefix + "ytplay":
        {
          if (!text) throw `Example : ${prefix + command} story wa anime`;
          let yts = require("yt-search");
          let search = await yts(text);
          let anu =
            search.videos[Math.floor(Math.random() * search.videos.length)];
          let buttons = [
            {
              buttonId: `ytmp3 ${anu.url}`,
              buttonText: { displayText: "♫ Audio" },
              type: 1,
            },
            {
              buttonId: `ytmp4 ${anu.url}`,
              buttonText: { displayText: "► Video" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: anu.thumbnail },
            caption: `
⭔ Title : ${anu.title}
⭔ Ext : Search
⭔ ID : ${anu.videoId}
⭔ Duration : ${anu.timestamp}
⭔ Viewers : ${anu.views}
⭔ Upload At : ${anu.ago}
⭔ Author : ${anu.author.name}
⭔ Channel : ${anu.author.url}
⭔ Description : ${anu.description}
⭔ Url : ${anu.url}`,
            footer: botname,
            buttons: buttons,
            headerType: 4,
          };
          client.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
        break;
      case prefix + "ytmp3":
      case prefix + "ytaudio":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          let { yta } = require("./lib/y2mate");
          if (!text)
            throw `Example : ${
              prefix + command
            } https://youtube.com/watch?v=PtFMh6Tccag%27 128kbps`;
          let quality = args[1] ? args[1] : "128kbps";
          let media = await yta(text, quality);
          if (media.filesize >= 100000)
            return m.reply("File Melebihi Batas " + util.format(media));
          client.sendImage(
            m.chat,
            media.thumb,
            `${sp} Title : ${media.title}\n${sp} File Size : ${
              media.filesizeF
            }\n${sp} Url : ${isUrl(text)}\n${sp} Ext : MP3\n${sp} Resolusi : ${
              args[1] || "128kbps"
            }`,
            m
          );
          client.sendMessage(
            m.chat,
            {
              document: await getBuffer(media.dl_link),
              mimetype: "audio/mpeg",
              fileName: `${media.title}.mp3`,
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "ytmp4":
      case prefix + "ytvideo":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          let { ytv } = require("./lib/y2mate");
          if (!text)
            throw `Example : ${
              prefix + command
            } https://youtube.com/watch?v=PtFMh6Tccag%27 360p`;
          let quality = args[1] ? args[1] : "360p";
          let media = await ytv(text, quality);
          if (media.filesize >= 100000)
            return m.reply("File Melebihi Batas " + util.format(media));
          client.sendMessage(
            m.chat,
            {
              video: { url: media.dl_link },
              mimetype: "video/mp4",
              fileName: `${media.title}.mp4`,
              caption: `${sp} Title : ${media.title}\n${sp} File Size : ${
                media.filesizeF
              }\n${sp} Url : ${isUrl(
                text
              )}\n${sp} Ext : MP3\n${sp} Resolusi : ${args[1] || "360p"}`,
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "getmusic":
        {
          let { yta } = require("./lib/y2mate");
          if (!text) throw `Example : ${prefix + command} 1`;
          if (!m.quoted) return m.reply("Reply Pesan");
          if (!m.quoted.isBaileys) throw `Hanya Bisa Membalas Pesan Dari Bot`;
          let urls = quoted.text.match(
            new RegExp(
              /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/,
              "gi"
            )
          );
          if (!urls)
            throw `Mungkin pesan yang anda reply tidak mengandung result ytsearch`;
          let quality = args[1] ? args[1] : "128kbps";
          let media = await yta(urls[text - 1], quality);
          if (media.filesize >= 100000)
            return m.reply("File Melebihi Batas " + util.format(media));
          client.sendImage(
            m.chat,
            media.thumb,
            `${sp} Title : ${media.title}\n${sp} File Size : ${
              media.filesizeF
            }\n${sp} Url : ${
              urls[text - 1]
            }\n${sp} Ext : MP3\n${sp} Resolusi : ${args[1] || "128kbps"}`,
            m
          );
          client.sendMessage(
            m.chat,
            {
              document: await getBuffer(media.dl_link),
              mimetype: "audio/mpeg",
              fileName: `${media.title}.mp3`,
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "getvideo":
        {
          let { ytv } = require("./lib/y2mate");
          if (!text) throw `Example : ${prefix + command} 1`;
          if (!m.quoted) return m.reply("Reply Pesan");
          if (!m.quoted.isBaileys) throw `Hanya Bisa Membalas Pesan Dari Bot`;
          let urls = quoted.text.match(
            new RegExp(
              /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/,
              "gi"
            )
          );
          if (!urls)
            throw `Mungkin pesan yang anda reply tidak mengandung result ytsearch`;
          let quality = args[1] ? args[1] : "360p";
          let media = await ytv(urls[text - 1], quality);
          if (media.filesize >= 100000)
            return m.reply("File Melebihi Batas " + util.format(media));
          client.sendMessage(
            m.chat,
            {
              video: { url: media.dl_link },
              mimetype: "video/mp4",
              fileName: `${media.title}.mp4`,
              caption: `${sp} Title : ${media.title}\n${sp} File Size : ${
                media.filesizeF
              }\n${sp} Url : ${
                urls[text - 1]
              }\n${sp} Ext : MP3\n${sp} Resolusi : ${args[1] || "360p"}`,
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "pinterest":
        {
          if (!text) throw `Example : ${prefix + command}`;
          m.reply(mess.wait);
          let { pinterest } = require("./lib/scraper");
          anu = await pinterest(text);
          result = anu[Math.floor(Math.random() * anu.length)];
          let buttons = [
            {
              buttonId: `pinterest ${text}`,
              buttonText: { displayText: "► NEXT" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: result },
            caption: `*Klik Next Untuk Melanjutkan*`,
            footer: client.user.name,
            buttons: buttons,
            headerType: 4,
          };
          client.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
        break;
      case prefix + "couple":
        {
          m.reply(mess.wait);
          let anu = await fetchJson(
            "https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json"
          );
          let random = anu[Math.floor(Math.random() * anu.length)];
          client.sendMessage(
            m.chat,
            { image: { url: random.male }, caption: `Couple Male` },
            { quoted: m }
          );
          client.sendMessage(
            m.chat,
            { image: { url: random.female }, caption: `Couple Female` },
            { quoted: m }
          );
        }
        break;
      case prefix + "coffe":
      case prefix + "kopi":
        {
          let buttons = [
            {
              buttonId: `coffe`,
              buttonText: { displayText: "Next Image" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: "https://coffee.alexflipnote.dev/random" },
            caption: `☕ Random Coffe`,
            footer: client.user.name,
            buttons: buttons,
            headerType: 4,
          };
          client.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
        break;
      case prefix + "wallpaper":
        {
          if (!text) throw "Masukkan Query Title";
          let { wallpaper } = require("./lib/scraper");
          anu = await wallpaper(text);
          result = anu[Math.floor(Math.random() * anu.length)];
          let buttons = [
            {
              buttonId: `wallpaper ${text}`,
              buttonText: { displayText: "Next Image" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: result.image[0] },
            caption: `${sp} Title : ${result.title}\n${sp} Category : ${
              result.type
            }\n${sp} Detail : ${result.source}\n${sp} Media Url : ${
              result.image[2] || result.image[1] || result.image[0]
            }`,
            footer: client.user.name,
            buttons: buttons,
            headerType: 4,
          };
          client.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
        break;
      case prefix + "wikimedia":
        {
          if (!text) throw "Masukkan Query Title";
          let { wikimedia } = require("./lib/scraper");
          anu = await wikimedia(text);
          result = anu[Math.floor(Math.random() * anu.length)];
          let buttons = [
            {
              buttonId: `wikimedia ${text}`,
              buttonText: { displayText: "Next Image" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: result.image },
            caption: `${sp} Title : ${result.title}\n${sp} Source : ${result.source}\n${sp} Media Url : ${result.image}`,
            footer: client.user.name,
            buttons: buttons,
            headerType: 4,
          };
          client.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
        break;
      case prefix + "quotesanime":
      case prefix + "quoteanime":
        {
          let { quotesAnime } = require("./lib/scraper");
          let anu = await quotesAnime();
          result = anu[Math.floor(Math.random() * anu.length)];
          let buttons = [
            {
              buttonId: `quotesanime`,
              buttonText: { displayText: "Next" },
              type: 1,
            },
          ];
          let buttonMessage = {
            text: `~_${result.quotes}_\n\nBy '${result.karakter}', ${result.anime}\n\n- ${result.up_at}`,
            footer: "Press The Button Below",
            buttons: buttons,
            headerType: 2,
          };
          client.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
        break;

      //────────────────────[ TEXT PROO ]────────────────────

      case prefix + "neon":
      case prefix + "snowtext":
      case prefix + "cloudtext":
      case prefix + "3dluxury":
      case prefix + "3dgradient":
      case prefix + "blackpink":
      case prefix + "realisticvintage":
      case prefix + "realisticloud":
      case prefix + "cloudsky":
      case prefix + "sandsummerbeach":
      case prefix + "sandwriting":
      case prefix + "sandengraved":
      case prefix + "ballontext":
      case prefix + "3dglue":
      case prefix + "space3d":
      case prefix + "metaldarkgold":
      case prefix + "glitch":
      case prefix + "neongalaxy":
      case prefix + "1917text":
      case prefix + "minion3d":
      case prefix + "holographic3d":
      case prefix + "metalpurple":
      case prefix + "duluxesilver":
      case prefix + "bluemetal":
      case prefix + "duluxegold":
      case prefix + "glossycarbon":
      case prefix + "febric":
      case prefix + "stone":
      case prefix + "pornhub":
      case prefix + "3davengers":
      case prefix + "marvelstudios":
      case prefix + "marvel":
      case prefix + "happynewyear":
      case prefix + "newyear3d":
      case prefix + "neontext":
      case prefix + "darkgoldeffect":
      case prefix + "hollowenfire":
      case prefix + "bloodtext":
      case prefix + "xmas3d":
      case prefix + "3dmetalsilver":
      case prefix + "3drosegold":
      case prefix + "3dmetalgold":
      case prefix + "3dmetalgalaxy":
      case prefix + "lionlogo":
      case prefix + "wolflogoblack":
      case prefix + "wolflogogalaxy":
      case prefix + "ninjalogo":
      case prefix + "jokerlogo":
      case prefix + "wicker":
      case prefix + "naturalleaves":
      case prefix + "fireworksparkle":
      case prefix + "skeleton":
      case prefix + "redfoilballon":
      case prefix + "purplefoilballon":
      case prefix + "pinkfoilballon":
      case prefix + "greenfoilballon":
      case prefix + "cyanfoilballon":
      case prefix + "bluefoilballon":
      case prefix + "goldfoilballon":
      case prefix + "steel":
      case prefix + "ultragloss":
      case prefix + "denim":
      case prefix + "decorategreen":
      case prefix + "decoratepurple":
      case prefix + "peridotstone":
      case prefix + "rock":
      case prefix + "lava":
      case prefix + "yellowglass":
      case prefix + "purpleglass":
      case prefix + "orangeglass":
      case prefix + "greenglass":
      case prefix + "blueglass":
      case prefix + "redglass":
      case prefix + "purpleshinyglass":
      case prefix + "captainamerica":
      case prefix + "robotr2d2":
      case prefix + "toxic":
      case prefix + "rainbowequalizier":
      case prefix + "pinksparklingjewelry":
        {
          if (!text) throw `Example : ${prefix + command} text`;
          m.reply(mess.wait);
          anu = await getBuffer(
            `https://xteam.xyz/textpro/${command}?text=${text}&APIKEY=${global.xteam}`
          );
          client
            .sendMessage(
              m.chat,
              { image: anu, caption: `Text Pro ${command}` },
              { quoted: m }
            )
            .catch((err) => m.reply("Maaf server Xteam sedang down"));
        }
        break;

      //────────────────────[ PRIMBON ]────────────────────

      case prefix + "nomerhoki":
      case prefix + "nomorhoki":
        {
          if (!Number(text))
            throw `Example : ${prefix + command} 6288292024190`;
          let anu = await primbon.nomer_hoki(Number(text));
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nomor HP :* ${anu.message.nomer_hp}\n${sp} *Angka Shuzi :* ${anu.message.angka_shuzi}\n${sp} *Energi Positif :*\n- Kekayaan : ${anu.message.energi_positif.kekayaan}\n- Kesehatan : ${anu.message.energi_positif.kesehatan}\n- Cinta : ${anu.message.energi_positif.cinta}\n- Kestabilan : ${anu.message.energi_positif.kestabilan}\n- Persentase : ${anu.message.energi_positif.persentase}\n${sp} *Energi Negatif :*\n- Perselisihan : ${anu.message.energi_negatif.perselisihan}\n- Kehilangan : ${anu.message.energi_negatif.kehilangan}\n- Malapetaka : ${anu.message.energi_negatif.malapetaka}\n- Kehancuran : ${anu.message.energi_negatif.kehancuran}\n- Persentase : ${anu.message.energi_negatif.persentase}`,
            m
          );
        }
        break;
      case prefix + "artimimpi":
      case prefix + "tafsirmimpi":
        {
          if (!text) throw `Example : ${prefix + command} belanja`;
          let anu = await primbon.tafsir_mimpi(text);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Mimpi :* ${anu.message.mimpi}\n${sp} *Arti :* ${anu.message.arti}\n${sp} *Solusi :* ${anu.message.solusi}`,
            m
          );
        }
        break;
      case prefix + "ramalanjodoh":
      case prefix + "ramaljodoh":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } Dika, 7, 7, 2005, Novia, 16, 11, 2004`;
          let [
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2,
          ] = text.split`,`;
          let anu = await primbon.ramalan_jodoh(
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2
          );
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama Anda :* ${anu.message.nama_anda.nama}\n${sp} *Lahir Anda :* ${anu.message.nama_anda.tgl_lahir}\n${sp} *Nama Pasangan :* ${anu.message.nama_pasangan.nama}\n${sp} *Lahir Pasangan :* ${anu.message.nama_pasangan.tgl_lahir}\n${sp} *Hasil :* ${anu.message.result}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "ramalanjodohbali":
      case prefix + "ramaljodohbali":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } Dika, 7, 7, 2005, Novia, 16, 11, 2004`;
          let [
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2,
          ] = text.split`,`;
          let anu = await primbon.ramalan_jodoh_bali(
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2
          );
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama Anda :* ${anu.message.nama_anda.nama}\n${sp} *Lahir Anda :* ${anu.message.nama_anda.tgl_lahir}\n${sp} *Nama Pasangan :* ${anu.message.nama_pasangan.nama}\n${sp} *Lahir Pasangan :* ${anu.message.nama_pasangan.tgl_lahir}\n${sp} *Hasil :* ${anu.message.result}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "suamiistri":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } Dika, 7, 7, 2005, Novia, 16, 11, 2004`;
          let [
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2,
          ] = text.split`,`;
          let anu = await primbon.suami_istri(
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2
          );
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama Suami :* ${anu.message.suami.nama}\n${sp} *Lahir Suami :* ${anu.message.suami.tgl_lahir}\n${sp} *Nama Istri :* ${anu.message.istri.nama}\n${sp} *Lahir Istri :* ${anu.message.istri.tgl_lahir}\n${sp} *Hasil :* ${anu.message.result}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "ramalancinta":
      case prefix + "ramalcinta":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } Dika, 7, 7, 2005, Novia, 16, 11, 2004`;
          let [
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2,
          ] = text.split`,`;
          let anu = await primbon.ramalan_cinta(
            nama1,
            tgl1,
            bln1,
            thn1,
            nama2,
            tgl2,
            bln2,
            thn2
          );
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama Anda :* ${anu.message.nama_anda.nama}\n${sp} *Lahir Anda :* ${anu.message.nama_anda.tgl_lahir}\n${sp} *Nama Pasangan :* ${anu.message.nama_pasangan.nama}\n${sp} *Lahir Pasangan :* ${anu.message.nama_pasangan.tgl_lahir}\n${sp} *Sisi Positif :* ${anu.message.sisi_positif}\n${sp} *Sisi Negatif :* ${anu.message.sisi_negatif}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "artinama":
        {
          if (!text) throw `Example : ${prefix + command} Dika Ardianta`;
          let anu = await primbon.arti_nama(text);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama :* ${anu.message.nama}\n${sp} *Arti :* ${anu.message.arti}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "kecocokannama":
      case prefix + "cocoknama":
        {
          if (!text) throw `Example : ${prefix + command} Dika, 7, 7, 2005`;
          let [nama, tgl, bln, thn] = text.split`,`;
          let anu = await primbon.kecocokan_nama(nama, tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama :* ${anu.message.nama}\n${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Life Path :* ${anu.message.life_path}\n${sp} *Destiny :* ${anu.message.destiny}\n${sp} *Destiny Desire :* ${anu.message.destiny_desire}\n${sp} *Personality :* ${anu.message.personality}\n${sp} *Persentase :* ${anu.message.persentase_kecocokan}`,
            m
          );
        }
        break;
      case prefix + "kecocokanpasangan":
      case prefix + "cocokpasangan":
      case prefix + "pasangan":
        {
          if (!text) throw `Example : ${prefix + command} Dika|Novia`;
          let [nama1, nama2] = text.split`|`;
          let anu = await primbon.kecocokan_nama_pasangan(nama1, nama2);
          if (anu.status == false) return m.reply(anu.message);
          client.sendImage(
            m.chat,
            anu.message.gambar,
            `${sp} *Nama Anda :* ${anu.message.nama_anda}\n${sp} *Nama Pasangan :* ${anu.message.nama_pasangan}\n${sp} *Sisi Positif :* ${anu.message.sisi_positif}\n${sp} *Sisi Negatif :* ${anu.message.sisi_negatif}`,
            m
          );
        }
        break;
      case prefix + "jadianpernikahan":
      case prefix + "jadiannikah":
        {
          if (!text) throw `Example : ${prefix + command} 6, 12, 2020`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.tanggal_jadian_pernikahan(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Tanggal Pernikahan :* ${anu.message.tanggal}\n${sp} *karakteristik :* ${anu.message.karakteristik}`,
            m
          );
        }
        break;
      case prefix + "sifatusaha":
        {
          if (!ext) throw `Example : ${prefix + command} 28, 12, 2021`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.sifat_usaha_bisnis(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Lahir :* ${anu.message.hari_lahir}\n${sp} *Usaha :* ${anu.message.usaha}`,
            m
          );
        }
        break;
      case prefix + "rejeki":
      case prefix + "rezeki":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.rejeki_hoki_weton(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Lahir :* ${anu.message.hari_lahir}\n${sp} *Rezeki :* ${anu.message.rejeki}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "pekerjaan":
      case prefix + "kerja":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.pekerjaan_weton_lahir(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Lahir :* ${anu.message.hari_lahir}\n${sp} *Pekerjaan :* ${anu.message.pekerjaan}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "ramalannasib":
      case prefix + "ramalnasib":
      case prefix + "nasib":
        {
          if (!text) throw `Example : 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.ramalan_nasib(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Analisa :* ${anu.message.analisa}\n${sp} *Angka Akar :* ${anu.message.angka_akar}\n${sp} *Sifat :* ${anu.message.sifat}\n${sp} *Elemen :* ${anu.message.elemen}\n${sp} *Angka Keberuntungan :* ${anu.message.angka_keberuntungan}`,
            m
          );
        }
        break;
      case prefix + "potensipenyakit":
      case prefix + "penyakit":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.cek_potensi_penyakit(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Analisa :* ${anu.message.analisa}\n${sp} *Sektor :* ${anu.message.sektor}\n${sp} *Elemen :* ${anu.message.elemen}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "artitarot":
      case prefix + "tarot":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.arti_kartu_tarot(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendImage(
            m.chat,
            anu.message.image,
            `${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Simbol Tarot :* ${anu.message.simbol_tarot}\n${sp} *Arti :* ${anu.message.arti}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "fengshui":
        {
          if (!text)
            throw `Example : ${prefix + command} Dika, 1, 2005\n\nNote : ${
              prefix + command
            } Nama, gender, tahun lahir\nGender : 1 untuk laki-laki & 2 untuk perempuan`;
          let [nama, gender, tahun] = text.split`,`;
          let anu = await primbon.perhitungan_feng_shui(nama, gender, tahun);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama :* ${anu.message.nama}\n${sp} *Lahir :* ${anu.message.tahun_lahir}\n${sp} *Gender :* ${anu.message.jenis_kelamin}\n${sp} *Angka Kua :* ${anu.message.angka_kua}\n${sp} *Kelompok :* ${anu.message.kelompok}\n${sp} *Karakter :* ${anu.message.karakter}\n${sp} *Sektor Baik :* ${anu.message.sektor_baik}\n${sp} *Sektor Buruk :* ${anu.message.sektor_buruk}`,
            m
          );
        }
        break;
      case prefix + "haribaik":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.petung_hari_baik(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Kala Tinantang :* ${anu.message.kala_tinantang}\n${sp} *Info :* ${anu.message.info}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "harisangar":
      case prefix + "taliwangke":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.hari_sangar_taliwangke(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Hasil :* ${anu.message.result}\n${sp} *Info :* ${anu.message.info}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "harinaas":
      case prefix + "harisial":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.primbon_hari_naas(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Hari Lahir :* ${anu.message.hari_lahir}\n${sp} *Tanggal Lahir :* ${anu.message.tgl_lahir}\n${sp} *Hari Naas :* ${anu.message.hari_naas}\n${sp} *Info :* ${anu.message.catatan}\n${sp} *Catatan :* ${anu.message.info}`,
            m
          );
        }
        break;
      case prefix + "nagahari":
      case prefix + "harinaga":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.rahasia_naga_hari(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Hari Lahir :* ${anu.message.hari_lahir}\n${sp} *Tanggal Lahir :* ${anu.message.tgl_lahir}\n${sp} *Arah Naga Hari :* ${anu.message.arah_naga_hari}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "arahrejeki":
      case prefix + "arahrezeki":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.primbon_arah_rejeki(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Hari Lahir :* ${anu.message.hari_lahir}\n${sp} *tanggal Lahir :* ${anu.message.tgl_lahir}\n${sp} *Arah Rezeki :* ${anu.message.arah_rejeki}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "peruntungan":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } DIka, 7, 7, 2005, 2022\n\nNote : ${
              prefix + command
            } Nama, tanggal lahir, bulan lahir, tahun lahir, untuk tahun`;
          let [nama, tgl, bln, thn, untuk] = text.split`,`;
          let anu = await primbon.ramalan_peruntungan(
            nama,
            tgl,
            bln,
            thn,
            untuk
          );
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama :* ${anu.message.nama}\n${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Peruntungan Tahun :* ${anu.message.peruntungan_tahun}\n${sp} *Hasil :* ${anu.message.result}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "weton":
      case prefix + "wetonjawa":
        {
          if (!text) throw `Example : ${prefix + command} 7, 7, 2005`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.weton_jawa(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Tanggal :* ${anu.message.tanggal}\n${sp} *Jumlah Neptu :* ${anu.message.jumlah_neptu}\n${sp} *Watak Hari :* ${anu.message.watak_hari}\n${sp} *Naga Hari :* ${anu.message.naga_hari}\n${sp} *Jam Baik :* ${anu.message.jam_baik}\n${sp} *Watak Kelahiran :* ${anu.message.watak_kelahiran}`,
            m
          );
        }
        break;
      case prefix + "sifat":
      case prefix + "karakter":
        {
          if (!text) throw `Example : ${prefix + command} Dika, 7, 7, 2005`;
          let [nama, tgl, bln, thn] = text.split`,`;
          let anu = await primbon.sifat_karakter_tanggal_lahir(
            nama,
            tgl,
            bln,
            thn
          );
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama :* ${anu.message.nama}\n${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Garis Hidup :* ${anu.message.garis_hidup}`,
            m
          );
        }
        break;
      case prefix + "keberuntungan":
        {
          if (!text) throw `Example : ${prefix + command} Dika, 7, 7, 2005`;
          let [nama, tgl, bln, thn] = text.split`,`;
          let anu = await primbon.potensi_keberuntungan(nama, tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Nama :* ${anu.message.nama}\n${sp} *Lahir :* ${anu.message.tgl_lahir}\n${sp} *Hasil :* ${anu.message.result}`,
            m
          );
        }
        break;
      case prefix + "memancing":
        {
          if (!text) throw `Example : ${prefix + command} 12, 1, 2022`;
          let [tgl, bln, thn] = text.split`,`;
          let anu = await primbon.primbon_memancing_ikan(tgl, bln, thn);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Tanggal :* ${anu.message.tgl_memancing}\n${sp} *Hasil :* ${anu.message.result}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "masasubur":
        {
          if (!text)
            throw `Example : ${prefix + command} 12, 1, 2022, 28\n\nNote : ${
              prefix + command
            } hari pertama menstruasi, siklus`;
          let [tgl, bln, thn, siklus] = text.split`,`;
          let anu = await primbon.masa_subur(tgl, bln, thn, siklus);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Hasil :* ${anu.message.result}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "zodiak":
      case prefix + "zodiac":
        {
          if (!text) throw `Example : ${prefix + command} 7 7 2005`;
          let zodiak = [
            ["capricorn", new Date(1970, 0, 1)],
            ["aquarius", new Date(1970, 0, 20)],
            ["pisces", new Date(1970, 1, 19)],
            ["aries", new Date(1970, 2, 21)],
            ["taurus", new Date(1970, 3, 21)],
            ["gemini", new Date(1970, 4, 21)],
            ["cancer", new Date(1970, 5, 22)],
            ["leo", new Date(1970, 6, 23)],
            ["virgo", new Date(1970, 7, 23)],
            ["libra", new Date(1970, 8, 23)],
            ["scorpio", new Date(1970, 9, 23)],
            ["sagittarius", new Date(1970, 10, 22)],
            ["capricorn", new Date(1970, 11, 22)],
          ].reverse();

          function getZodiac(month, day) {
            let d = new Date(1970, month - 1, day);
            return zodiak.find(([_, _d]) => d >= _d)[0];
          }
          let date = new Date(text);
          if (date == "Invalid Date") throw date;
          let d = new Date();
          let [tahun, bulan, tanggal] = [
            d.getFullYear(),
            d.getMonth() + 1,
            d.getDate(),
          ];
          let birth = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

          let zodiac = await getZodiac(birth[1], birth[2]);

          let anu = await primbon.zodiak(zodiac);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(
            m.chat,
            `${sp} *Zodiak :* ${anu.message.zodiak}\n${sp} *Nomor :* ${anu.message.nomor_keberuntungan}\n${sp} *Aroma :* ${anu.message.aroma_keberuntungan}\n${sp} *Planet :* ${anu.message.planet_yang_mengitari}\n${sp} *Bunga :* ${anu.message.bunga_keberuntungan}\n${sp} *Warna :* ${anu.message.warna_keberuntungan}\n${sp} *Batu :* ${anu.message.batu_keberuntungan}\n${sp} *Elemen :* ${anu.message.elemen_keberuntungan}\n${sp} *Pasangan Zodiak :* ${anu.message.pasangan_zodiak}\n${sp} *Catatan :* ${anu.message.catatan}`,
            m
          );
        }
        break;
      case prefix + "shio":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } tikus\n\nNote : For Detail https://primbon.com/shio.htm`;
          let anu = await primbon.shio(text);
          if (anu.status == false) return m.reply(anu.message);
          client.sendText(m.chat, `${sp} *Hasil :* ${anu.message}`, m);
        }
        break;

      //────────────────────[ DOWNLOADER ]────────────────────
      case prefix + "tiktok":
      case prefix + "tt":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0]) throw "Linknya mana?";
          if (!args[0].match(/tiktok/gi)) throw "url salah";
          m.reply(mess.wait);
          var tk = await bochil.tiktokdl(args[0]);
          var { no_watermark } = tk.video;
          client.sendMessage(
            m.chat,
            {
              video: { url: no_watermark },
              caption: `Audio pencet tombol dibawah`,
              buttons: [
                {
                  buttonId: `${prefix}ttaudio ${args[0]}`,
                  buttonText: { displayText: "Audio" },
                  type: 1,
                },
              ],
              footer: wm,
            },
            { quoted: m }
          );
        }
        break;

      case prefix + "tiktokaudio":
      case prefix + "ttaudio":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0]) throw "Linknya mana?";
          if (!args[0].match(/tiktok/gi)) throw "url salah";
          m.reply(mess.wait);
          var nt = await bochil.savefrom(args[0]);
          var { url } = nt.url[1];
          client.sendMessage(
            m.chat,
            { audio: { url: url }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        }
        break;

      case prefix + "fb":
      case prefix + "facebook":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0]) throw "Linknya mana?";
          m.reply(mess.wait);
          let res = await bochil.savefrom(args[0]);
          let asu = res.url;
          let { url } = await asu[0];
          client.sendMessage(
            m.chat,
            { video: { url: url }, mimetype: "video/mp4", caption: wm },
            { quoted: m }
          );
          //client.sendMedia2(m.chat, url, m, { caption: wm })
        }
        break;

      case prefix + "instagram":
      case prefix + "ig":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0]) throw "Linknya mana?";
          if (!args[0].match(/instagram/gi)) throw "url salah";
          m.reply(mess.wait);
          var g = await bochil.instagramdlv3(args[0]);
          var urlc = g[0].url;
          for (let { thumbnail, url, sourceUrl } of g)
            client.sendFile(
              m.chat,
              url,
              "ig" + (sourceUrl == "image" ? ".jpg" : ".mp4"),
              wm,
              m
            );
        }
        break;

      case prefix + "umma":
      case prefix + "ummadl":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!text)
            throw `Example : ${
              prefix + command
            } https://umma.id/channel/video/post/gus-arafat-sumber-kecewa-84464612933698`;
          let { umma } = require("./lib) scraper");
          let anu = await umma(isUrl(text)[0]);
          if (anu.type == "video") {
            let buttons = [
              {
                buttonId: `ytmp3 ${anu.media[0]} 128kbps`,
                buttonText: { displayText: "♫ Audio" },
                type: 1,
              },
              {
                buttonId: `ytmp4 ${anu.media[0]} 360p`,
                buttonText: { displayText: "► Video" },
                type: 1,
              },
            ];
            let buttonMessage = {
              image: { url: anu.author.profilePic },
              caption: `
${sp} Title : ${anu.title}
${sp} Author : ${anu.author.name}
${sp} Like : ${anu.like}
${sp} Caption : ${anu.caption}
${sp} Url : ${anu.media[0]}
Untuk Download Media Silahkan Klik salah satu Button dibawah ini atau masukkan command ytmp3/ytmp4 dengan url diatas
`,
              footer: client.user.name,
              buttons,
              headerType: 4,
            };
            client.sendMessage(m.chat, buttonMessage, { quoted: m });
          } else if (anu.type == "image") {
            anu.media.map(async (url) => {
              client.sendMessage(
                m.chat,
                {
                  image: { url },
                  caption: `${sp} Title : ${anu.title}\n${sp} Author : ${anu.author.name}\n${sp} Like : ${anu.like}\n${sp} Caption : ${anu.caption}`,
                },
                { quoted: m }
              );
            });
          }
        }
        break;

      //────────────────────[ ISLAMIC FEATURE ]────────────────────

      case prefix + "ringtone":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!text) throw `Example : ${prefix + command} black rover`;
          let { ringtone } = require("./lib/scraper");
          let anu = await ringtone(text);
          let result = anu[Math.floor(Math.random() * anu.length)];
          client.sendMessage(
            m.chat,
            {
              audio: { url: result.audio },
              fileName: result.title + ".mp3",
              mimetype: "audio/mpeg",
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "iqra":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          oh = `Example : ${
            prefix + command
          } 3\n\nIQRA Yang tersedia : 1,2,3,4,5,6`;
          if (!text) throw oh;
          yy = await getBuffer(
            `https://islamic-api-indonesia.herokuapp.com/api/data/pdf/iqra${text}`
          );
          client
            .sendMessage(
              m.chat,
              {
                document: yy,
                mimetype: "application/pdf",
                fileName: `iqra${text}.pdf`,
              },
              { quoted: m }
            )
            .catch((err) => m.reply(oh));
        }
        break;
      case prefix + "juzamma":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (args[0] === "pdf") {
            m.reply(mess.wait);
            client.sendMessage(
              m.chat,
              {
                document: {
                  url: "https://fatiharridho.my.id/database/islam/juz-amma-arab-latin-indonesia.pdf",
                },
                mimetype: "application/pdf",
                fileName: "juz-amma-arab-latin-indonesia.pdf",
              },
              { quoted: m }
            );
          } else if (args[0] === "docx") {
            m.reply(mess.wait);
            client.sendMessage(
              m.chat,
              {
                document: {
                  url: "https://fatiharridho.my.id/database/islam/juz-amma-arab-latin-indonesia.docx",
                },
                mimetype:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileName: "juz-amma-arab-latin-indonesia.docx",
              },
              { quoted: m }
            );
          } else if (args[0] === "pptx") {
            m.reply(mess.wait);
            client.sendMessage(
              m.chat,
              {
                document: {
                  url: "https://fatiharridho.my.id/database/islam/juz-amma-arab-latin-indonesia.pptx",
                },
                mimetype:
                  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileName: "juz-amma-arab-latin-indonesia.pptx",
              },
              { quoted: m }
            );
          } else if (args[0] === "xlsx") {
            m.reply(mess.wait);
            client.sendMessage(
              m.chat,
              {
                document: {
                  url: "https://fatiharridho.my.id/database/islam/juz-amma-arab-latin-indonesia.xlsx",
                },
                mimetype:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName: "juz-amma-arab-latin-indonesia.xlsx",
              },
              { quoted: m }
            );
          } else {
            m.reply(`Mau format apa ? Example : ${prefix + command} pdf

Format yang tersedia : pdf, docx, pptx, xlsx`);
          }
        }
        break;
      case prefix + "hadis":
      case prefix + "hadist":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0])
            throw `Contoh:
${prefix + command} bukhari 1
${prefix + command} abu-daud 1

Pilihan tersedia:
abu-daud
1 - 4590
ahmad
1 - 26363
bukhari
1 - 7008
darimi
1 - 3367
ibu-majah
1 - 4331
nasai
1 - 5662
malik
1 - 1594
muslim
1 - 5362`;
          if (!args[1])
            throw `Hadis yang ke berapa?\n\ncontoh:\n${
              prefix + command
            } muslim 1`;
          try {
            let res = await fetchJson(
              `https://islamic-api-indonesia.herokuapp.com/api/data/json/hadith/${args[0]}`
            );
            let { number, arab, id } = res.find((v) => v.number == args[1]);
            m.reply(`No. ${number}

${arab}

${id}`);
          } catch (e) {
            m.reply(`Hadis tidak ditemukan !`);
          }
        }
        break;
      case prefix + "alquran":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0])
            throw `Contoh penggunaan:\n${
              prefix + command
            } 1 2\n\nmaka hasilnya adalah surah Al-Fatihah ayat 2 beserta audionya, dan ayatnya 1 aja`;
          if (!args[1])
            throw `Contoh penggunaan:\n${
              prefix + command
            } 1 2\n\nmaka hasilnya adalah surah Al-Fatihah ayat 2 beserta audionya, dan ayatnya 1 aja`;
          let res = await fetchJson(
            `https://islamic-api-indonesia.herokuapp.com/api/data/quran?surah=${args[0]}&ayat=${args[1]}`
          );
          let txt = `*Arab* : ${res.result.data.text.arab}
*English* : ${res.result.data.translation.en}
*Indonesia* : ${res.result.data.translation.id}

( Q.S ${res.result.data.surah.name.transliteration.id} : ${res.result.data.number.inSurah} )`;
          m.reply(txt);
          client.sendMessage(
            m.chat,
            {
              audio: { url: res.result.data.audio.primary },
              mimetype: "audio/mpeg",
            },
            { quoted: m }
          );
        }
        break;
      case prefix + "tafsirsurah":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          if (!args[0])
            throw `Contoh penggunaan:\n${
              prefix + command
            } 1 2\n\nmaka hasilnya adalah tafsir surah Al-Fatihah ayat 2`;
          if (!args[1])
            throw `Contoh penggunaan:\n${
              prefix + command
            } 1 2\n\nmaka hasilnya adalah tafsir surah Al-Fatihah ayat 2`;
          let res = await fetchJson(
            `https://islamic-api-indonesia.herokuapp.com/api/data/quran?surah=${args[0]}&ayat=${args[1]}`
          );
          let txt = `「 *Tafsir Surah*  」

*Pendek* : ${res.result.data.tafsir.id.short}

*Panjang* : ${res.result.data.tafsir.id.long}

( Q.S ${res.result.data.surah.name.transliteration.id} : ${res.result.data.number.inSurah} )`;
          m.reply(txt);
        }
        break;

      //────────────────────[ VOICE CHANGER ]────────────────────
      case prefix + "bass":
      case prefix + "blown":
      case prefix + "deep":
      case prefix + "earrape":
      case prefix + "fast":
      case prefix + "fat":
      case prefix + "nightcore":
      case prefix + "reverse":
      case prefix + "robot":
      case prefix + "slow":
      case prefix + "smooth":
      case prefix + "tupai":
        try {
          let set;
          if (/bass/.test(command))
            set = "-af equalizer=f=54:width_type=o:width=2:g=20";
          if (/blown/.test(command)) set = "-af acrusher=.1:1:64:0:log";
          if (/deep/.test(command)) set = "-af atempo=4/4,asetrate=44500*2/3";
          if (/earrape/.test(command)) set = "-af volume=12";
          if (/fast/.test(command))
            set = '-filter:a "atempo=1.63,asetrate=44100"';
          if (/fat/.test(command))
            set = '-filter:a "atempo=1.6,asetrate=22100"';
          if (/nightcore/.test(command))
            set = "-filter:a atempo=1.06,asetrate=44100*1.25";
          if (/reverse/.test(command)) set = '-filter_complex "areverse"';
          if (/robot/.test(command))
            set =
              "-filter_complex \"afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75\"";
          if (/slow/.test(command))
            set = '-filter:a "atempo=0.7,asetrate=44100"';
          if (/smooth/.test(command))
            set =
              "-filter:v \"minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120'\"";
          if (/tupai/.test(command))
            set = '-filter:a "atempo=0.5,asetrate=65100"';
          if (/audio/.test(mime)) {
            m.reply(mess.wait);
            let media = await client.downloadAndSaveMediaMessage(quoted);
            let ran = getRandom(".mp3");
            exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
              fs.unlinkSync(media);
              if (err) return m.reply(err);
              let buff = fs.readFileSync(ran);
              client.sendMessage(
                m.chat,
                { audio: buff, mimetype: "audio/mpeg" },
                { quoted: m }
              );
              fs.unlinkSync(ran);
            });
          } else
            m.reply(
              `Balas audio yang ingin diubah dengan caption *${
                prefix + command
              }*`
            );
        } catch (e) {
          m.reply(e);
        }
        break;

      //────────────────────[ DATABASE ]────────────────────

      case prefix + "setcmd":
        {
          if (!m.quoted) throw "Reply Pesan!";
          if (!m.quoted.fileSha256) throw "SHA256 Hash Missing";
          if (!text) throw `Untuk Command Apa?`;
          let hash = m.quoted.fileSha256.toString("base64");
          if (
            global.db.data.sticker[hash] &&
            global.db.data.sticker[hash].locked
          )
            throw "You have no permission to change this sticker command";
          global.db.data.sticker[hash] = {
            text,
            mentionedJid: m.mentionedJid,
            creator: m.sender,
            at: +new Date(),
            locked: false,
          };
          m.reply(`Done!`);
        }
        break;
      case prefix + "delcmd":
        {
          let hash = m.quoted.fileSha256.toString("base64");
          if (!hash) throw `Tidak ada hash`;
          if (
            global.db.data.sticker[hash] &&
            global.db.data.sticker[hash].locked
          )
            throw "You have no permission to delete this sticker command";
          delete global.db.data.sticker[hash];
          m.reply(`Done!`);
        }
        break;
      case prefix + "listcmd":
        {
          let teks = `
*List Hash*
Info: *bold* hash is Locked
${Object.entries(global.db.data.sticker)
  .map(
    ([key, value], index) =>
      `${index + 1}. ${value.locked ? `*${key}*` : key} : ${value.text}`
  )
  .join("\n")}
`.trim();
          client.sendText(m.chat, teks, m, {
            mentions: Object.values(global.db.data.sticker)
              .map((x) => x.mentionedJid)
              .reduce((a, b) => [...a, ...b], []),
          });
        }
        break;
      case prefix + "lockcmd":
        {
          if (!isCreator) throw mess.owner;
          if (!m.quoted) throw "Reply Pesan!";
          if (!m.quoted.fileSha256) throw "SHA256 Hash Missing";
          let hash = m.quoted.fileSha256.toString("base64");
          if (!(hash in global.db.data.sticker))
            throw "Hash not found in database";
          global.db.data.sticker[hash].locked = !/^un/i.test(command);
          m.reply("Done!");
        }
        break;
      case prefix + "addmsg":
        {
          if (!m.quoted) throw "Reply Message Yang Ingin Disave Di Database";
          if (!text) throw `Example : ${prefix + command} nama file`;
          let msgs = global.db.data.database;
          if (text.toLowerCase() in msgs)
            throw `'${text}' telah terdaftar di list pesan`;
          msgs[text.toLowerCase()] = quoted.fakeObj;
          m.reply(`Berhasil menambahkan pesan di list pesan sebagai '${text}'

Akses dengan ${prefix}getmsg ${text}

Lihat list Pesan Dengan ${prefix}listmsg`);
        }
        break;
      case prefix + "getmsg":
        {
          if (!text)
            throw `Example : ${
              prefix + command
            } file name\n\nLihat list pesan dengan ${prefix}listmsg`;
          let msgs = global.db.data.database;
          if (!(text.toLowerCase() in msgs))
            throw `'${text}' tidak terdaftar di list pesan`;
          client.copyNForward(m.chat, msgs[text.toLowerCase()], true);
        }
        break;
      case prefix + "listmsg":
        {
          let msgs = JSON.parse(fs.readFileSync("./src/database.json"));
          let seplit = Object.entries(global.db.data.database).map(
            ([nama, isi]) => {
              return { nama, ...isi };
            }
          );
          let teks = "「 LIST DATABASE 」\n\n";
          for (let i of seplit) {
            teks += `${sp} *Name :* ${i.nama}\n${sp} *Type :* ${getContentType(
              i.message
            ).replace(/Message/i, "")}\n────────────────────────\n\n`;
          }
          m.reply(teks);
        }
        break;
      case prefix + "delmsg":
      case prefix + "deletemsg":
        {
          let msgs = global.db.data.database;
          if (!(text.toLowerCase() in msgs))
            return m.reply(`'${text}' tidak terdaftar didalam list pesan`);
          delete msgs[text.toLowerCase()];
          m.reply(`Berhasil menghapus '${text}' dari list pesan`);
        }
        break;

      //────────────────────[ ANONYMOUS CHAT ]────────────────────

      case prefix + "anonymous":
        {
          if (m.isGroup)
            return m.reply("Fitur Tidak Dapat Digunakan Untuk Group!");
          this.anonymous = this.anonymous ? this.anonymous : {};
          let buttons = [
            {
              buttonId: "start",
              buttonText: { displayText: "Start" },
              type: 1,
            },
          ];
          client.sendButtonText(
            m.chat,
            buttons,
            `\`\`\`Hi ${await client.getName(
              m.sender
            )} Welcome To Anonymous Chat\n\nKlik Button Dibawah Ini Untuk Mencari Partner\`\`\``,
            client.user.name,
            m
          );
        }
        break;
      case prefix + "keluar":
      case prefix + "leave": {
        if (m.isGroup)
          return m.reply("Fitur Tidak Dapat Digunakan Untuk Group!");
        this.anonymous = this.anonymous ? this.anonymous : {};
        let room = Object.values(this.anonymous).find((room) =>
          room.check(m.sender)
        );
        if (!room) {
          let buttons = [
            {
              buttonId: "start",
              buttonText: { displayText: "Start" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            `\`\`\`Kamu Sedang Tidak Berada Di Sesi Anonymous, Tekan Button Untuk Mencari Partner \`\`\``
          );
          throw false;
        }
        m.reply("Ok");
        let other = room.other(m.sender);
        if (other)
          await client.sendText(
            other,
            `\`\`\`Partner Telah Meninggalkan Sesi Anonymous\`\`\``,
            m
          );
        delete this.anonymous[room.id];
        if (command === "leave") break;
      }
      case prefix + "mulai":
      case prefix + "start": {
        if (m.isGroup)
          return m.reply("Fitur Tidak Dapat Digunakan Untuk Group!");
        this.anonymous = this.anonymous ? this.anonymous : {};
        if (
          Object.values(this.anonymous).find((room) => room.check(m.sender))
        ) {
          let buttons = [
            {
              buttonId: "keluar",
              buttonText: { displayText: "Stop" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            `\`\`\`Kamu Masih Berada Di dalam Sesi Anonymous, Tekan Button Dibawah Ini Untuk Menghentikan Sesi Anonymous Anda\`\`\``,
            client.user.name,
            m
          );
          throw false;
        }
        let room = Object.values(this.anonymous).find(
          (room) => room.state === "WAITING" && !room.check(m.sender)
        );
        if (room) {
          let buttons = [
            { buttonId: "next", buttonText: { displayText: "Skip" }, type: 1 },
            {
              buttonId: "keluar",
              buttonText: { displayText: "Stop" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            room.a,
            buttons,
            `\`\`\`Berhasil Menemukan Partner, sekarang kamu dapat mengirim pesan\`\`\``,
            client.user.name,
            m
          );
          room.b = m.sender;
          room.state = "CHATTING";
          await client.sendButtonText(
            room.b,
            buttons,
            `\`\`\`Berhasil Menemukan Partner, sekarang kamu dapat mengirim pesan\`\`\``,
            client.user.name,
            m
          );
        } else {
          let id = +new Date();
          this.anonymous[id] = {
            id,
            a: m.sender,
            b: "",
            state: "WAITING",
            check: function (who = "") {
              return [this.a, this.b].includes(who);
            },
            other: function (who = "") {
              return who === this.a ? this.b : who === this.b ? this.a : "";
            },
          };
          let buttons = [
            {
              buttonId: "keluar",
              buttonText: { displayText: "Stop" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            `\`\`\`Mohon Tunggu Sedang Mencari Partner\`\`\``,
            client.user.name,
            m
          );
        }
        break;
      }
      case prefix + "next":
      case prefix + "lanjut": {
        if (m.isGroup)
          return m.reply("Fitur Tidak Dapat Digunakan Untuk Group!");
        this.anonymous = this.anonymous ? this.anonymous : {};
        let romeo = Object.values(this.anonymous).find((room) =>
          room.check(m.sender)
        );
        if (!romeo) {
          let buttons = [
            {
              buttonId: "start",
              buttonText: { displayText: "Start" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            `\`\`\`Kamu Sedang Tidak Berada Di Sesi Anonymous, Tekan Button Untuk Mencari Partner\`\`\``
          );
          throw false;
        }
        let other = romeo.other(m.sender);
        if (other)
          await client.sendText(
            other,
            `\`\`\`Partner Telah Meninggalkan Sesi Anonymous\`\`\``,
            m
          );
        delete this.anonymous[romeo.id];
        let room = Object.values(this.anonymous).find(
          (room) => room.state === "WAITING" && !room.check(m.sender)
        );
        if (room) {
          let buttons = [
            { buttonId: "next", buttonText: { displayText: "Skip" }, type: 1 },
            {
              buttonId: "keluar",
              buttonText: { displayText: "Stop" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            room.a,
            buttons,
            `\`\`\`Berhasil Menemukan Partner, sekarang kamu dapat mengirim pesan\`\`\``,
            client.user.name,
            m
          );
          room.b = m.sender;
          room.state = "CHATTING";
          await client.sendButtonText(
            room.b,
            buttons,
            `\`\`\`Berhasil Menemukan Partner, sekarang kamu dapat mengirim pesan\`\`\``,
            client.user.name,
            m
          );
        } else {
          let id = +new Date();
          this.anonymous[id] = {
            id,
            a: m.sender,
            b: "",
            state: "WAITING",
            check: function (who = "") {
              return [this.a, this.b].includes(who);
            },
            other: function (who = "") {
              return who === this.a ? this.b : who === this.b ? this.a : "";
            },
          };
          let buttons = [
            {
              buttonId: "keluar",
              buttonText: { displayText: "Stop" },
              type: 1,
            },
          ];
          await client.sendButtonText(
            m.chat,
            buttons,
            `\`\`\`Mohon Tunggu Sedang Mencari Partner\`\`\``,
            client.user.name,
            m
          );
        }
        break;
      }

      //────────────────────[ OWNER MENU ]────────────────────

      case prefix + "public":
        {
          if (!isCreator) throw mess.owner;
          client.public = true;
          m.reply("Sukse Change To Public Usage");
        }
        break;
      case prefix + "self":
        {
          if (!isCreator) throw mess.owner;
          client.public = false;
          m.reply("Sukses Change To Self Usage");
        }
        break;

      //────────────────────[ INFO BOT ]────────────────────

      case prefix + "ping":
      case prefix + "botstatus":
      case prefix + "statusbot":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          const used = process.memoryUsage();
          const cpus = os.cpus().map((cpu) => {
            cpu.total = Object.keys(cpu.times).reduce(
              (last, type) => last + cpu.times[type],
              0
            );
            return cpu;
          });
          const cpu = cpus.reduce(
            (last, cpu, _, { length }) => {
              last.total += cpu.total;
              last.speed += cpu.speed / length;
              last.times.user += cpu.times.user;
              last.times.nice += cpu.times.nice;
              last.times.sys += cpu.times.sys;
              last.times.idle += cpu.times.idle;
              last.times.irq += cpu.times.irq;
              return last;
            },
            {
              speed: 0,
              total: 0,
              times: {
                user: 0,
                nice: 0,
                sys: 0,
                idle: 0,
                irq: 0,
              },
            }
          );
          let timestamp = speed();
          let latensi = speed() - timestamp;
          neww = performance.now();
          oldd = performance.now();
          respon = `
Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${
            oldd - neww
          } _miliseconds_\n\nRuntime : ${runtime(process.uptime())}

💻 Info Server
RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}

_NodeJS Memory Usaage_
${Object.keys(used)
  .map(
    (key, _, arr) =>
      `${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")}: ${formatp(
        used[key]
      )}`
  )
  .join("\n")}

${
  cpus[0]
    ? `_Total CPU Usage_
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
        .map(
          (type) =>
            `- *${(type + "*").padEnd(6)}: ${(
              (100 * cpu.times[type]) /
              cpu.total
            ).toFixed(2)}%`
        )
        .join("\n")}
_CPU Core(s) Usage (${cpus.length} Core CPU)_
${cpus
  .map(
    (cpu, i) =>
      `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(
        cpu.times
      )
        .map(
          (type) =>
            `- *${(type + "*").padEnd(6)}: ${(
              (100 * cpu.times[type]) /
              cpu.total
            ).toFixed(2)}%`
        )
        .join("\n")}`
  )
  .join("\n\n")}`
    : ""
}
`.trim();
          m.reply(respon);
        }
        break;
      case prefix + "speedtest":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          m.reply("Testing Speed...");
          let cp = require("child_process");
          let { promisify } = require("util");
          let exec = promisify(cp.exec).bind(cp);
          let o;
          try {
            o = await exec("python speed.py");
          } catch (e) {
            o = e;
          } finally {
            let { stdout, stderr } = o;
            if (stdout.trim()) m.reply(stdout);
            if (stderr.trim()) m.reply(stderr);
          }
        }
        break;
      case prefix + "owner":
      case prefix + "creator":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          client.sendContact(m.chat, global.owner, m);
        }
        break;

      //────────────────────[ MAIN MENU HOOOOOOHHH ]────────────────────

      case prefix + "menu":
      case prefix + "help":
      case prefix + "?":
        {
          addCountCmd(`#${command.slice(1)}`, sender, _cmd);
          anu = `Halo @${m.sender.split("@")[0]} 🌺
Saya Bot yang siap membantu anda
mendownload dan mencari
informasi melalui WhatsApp.
   
◦ *Name* : ${global.botname}
◦ *Runtime* : ${runtime(process.uptime())}
◦ *Library* : Baileys v4.5.8
◦ *Waktu* : ${moment.tz("Asia/Jakarta").format("DD/MM/YY")} - ${moment
            .tz("Asia/Jakarta")
            .format("HH:mm:ss")}

Jika ada eror, atau ingin sewa bot silahkan hubungi owner.
‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
–   *M A I N*

┌	◦ ${prefix}menu
└	◦ ${prefix}afk

–   *G R O U P*

┌	◦ ${prefix}linkgroup
│	◦ ${prefix}ephemeral *option*
│	◦ ${prefix}setppgc *image*
│	◦ ${prefix}setname *text*
│	◦ ${prefix}setdesc *text*
│	◦ ${prefix}group *option*
│	◦ ${prefix}editinfo *option*
│	◦ ${prefix}add *@user*
│	◦ ${prefix}kick *@user*
│	◦ ${prefix}hidetag *text*
│	◦ ${prefix}tagall *text*
│	◦ ${prefix}antilink *on/off*
│	◦ ${prefix}mute *on/off*
│	◦ ${prefix}promote *@user*
│	◦ ${prefix}demote *@user*
│	◦ ${prefix}vote *text*
│	◦ ${prefix}devote
│	◦ ${prefix}upvote
│	◦ ${prefix}cekvote
└	◦ ${prefix}hapusvote

–   *D O W N L O A D E R*

┌	◦ ${prefix}tiktok *url*
│	◦ ${prefix}tiktokaudio *url*
│	◦ ${prefix}instagram *url*
│	◦ ${prefix}twitter *url*
│	◦ ${prefix}facebook *url*
│	◦ ${prefix}ytmp3 *url*
│	◦ ${prefix}ytmp4 *url*
│	◦ ${prefix}getmusic *query*
│	◦ ${prefix}getvideo *query*
│	◦ ${prefix}umma *url*
│	◦ ${prefix}joox *query*
└	◦ ${prefix}soundcloud *url*

–   *S E A R C H*

┌	◦ ${prefix}play *query*
│	◦ ${prefix}yts *query*
│	◦ ${prefix}google *query*
│	◦ ${prefix}gimage *query*
│	◦ ${prefix}pinterest *query*
│	◦ ${prefix}wallpaper *query*
│	◦ ${prefix}wikimedia *query*
│	◦ ${prefix}ytsearch *query*
└	◦ ${prefix}ringtone *query*

–   *R A N D O M*

┌	◦ ${prefix}coffe
└	◦ ${prefix}quotesanime

–   *F U N*

┌	◦ ${prefix}halah
│	◦ ${prefix}hilih
│	◦ ${prefix}huluh
│	◦ ${prefix}heleh
│	◦ ${prefix}holoh
│	◦ ${prefix}jadian
└	◦ ${prefix}jodohku

–   *P R I M B O N*

┌	◦ ${prefix}nomorhoki
│	◦ ${prefix}artimimpi
│	◦ ${prefix}artinama
│	◦ ${prefix}ramaljodoh
│	◦ ${prefix}ramaljodohbali
│	◦ ${prefix}suamiistri
│	◦ ${prefix}ramalcinta
│	◦ ${prefix}cocoknama
│	◦ ${prefix}pasangan
│	◦ ${prefix}jadiannikah
│	◦ ${prefix}sifatusaha
│	◦ ${prefix}rezeki
│	◦ ${prefix}pekerjaan
│	◦ ${prefix}nasib
│	◦ ${prefix}penyakit
│	◦ ${prefix}tarot
│	◦ ${prefix}fengshui
│	◦ ${prefix}haribaik
│	◦ ${prefix}harisangar
│	◦ ${prefix}harisial
│	◦ ${prefix}nagahari
│	◦ ${prefix}arahrezeki
│	◦ ${prefix}peruntungan
│	◦ ${prefix}weton
│	◦ ${prefix}karakter
│	◦ ${prefix}keberuntungan
│	◦ ${prefix}memancing
│	◦ ${prefix}masasubur
│	◦ ${prefix}zodiak
└	◦ ${prefix}shio

–   *C O N V E R T*

┌	◦ ${prefix}toimage
│	◦ ${prefix}removebg
│	◦ ${prefix}sticker
│	◦ ${prefix}emojimix
│	◦ ${prefix}tovideo
│	◦ ${prefix}togif
│	◦ ${prefix}tourl
│	◦ ${prefix}tovn
│	◦ ${prefix}tomp3
│	◦ ${prefix}toaudio
│	◦ ${prefix}ebinary
│	◦ ${prefix}dbinary
└	◦ ${prefix}styletext

–   *D A T  A B A S E*

┌	◦ ${prefix}setcmd
│	◦ ${prefix}listcmd
│	◦ ${prefix}delcmd
│	◦ ${prefix}lockcmd
│	◦ ${prefix}addmsg
│	◦ ${prefix}listmsg
│	◦ ${prefix}getmsg
└	◦ ${prefix}delmsg

–   *A N O N Y M O U S*

┌	◦ ${prefix}anonymous
│	◦ ${prefix}start
│	◦ ${prefix}next
│	◦ ${prefix}keluar
└	◦ ${prefix}sendkontak

–   *R E L I G I O N*

┌	◦ ${prefix}iqra
│	◦ ${prefix}hadist
│	◦ ${prefix}alquran
│	◦ ${prefix}juzamma
└	◦ ${prefix}tafsirsurah

–   *V O I C E*

┌	◦ ${prefix}bass
│	◦ ${prefix}blown
│	◦ ${prefix}deep
│	◦ ${prefix}earrape
│	◦ ${prefix}fast
│	◦ ${prefix}fat
│	◦ ${prefix}nightcore
│	◦ ${prefix}reverse
│	◦ ${prefix}robot
│	◦ ${prefix}slow
└	◦ ${prefix}tupai

–   *O W N E R*

┌	◦ ${prefix}react *emoji*
│	◦ ${prefix}chat *option*
│	◦ ${prefix}join *link*
│	◦ ${prefix}leave
│	◦ ${prefix}block *@user*
│	◦ ${prefix}unblock *@user*
│	◦ ${prefix}bcgroup *text*
│	◦ ${prefix}bcall *text*
│	◦ ${prefix}setppbot *image*
└	◦ ${prefix}setexif
`;
          var button = [
            {
              buttonId: `dashboard`,
              buttonText: { displayText: `dashboard` },
              type: 1,
            },
            {
              buttonId: `owner`,
              buttonText: { displayText: `owner` },
              type: 1,
            },
          ];
          client.sendMessage(m.chat, {
            caption: `${anu}`,
            location: {
              jpegThumbnail: await client.reSize(
                "https://telegra.ph/file/9079f6387a541a7ae4a58.jpg",
                300,
                300
              ),
            },
            buttons: button,
            footer: botname,
            mentions: [m.sender],
          });
        }
        break;

      //Batas
      default:
        if (budy.startsWith("=>")) {
          if (!isCreator) return m.reply(mess.owner);
          function Return(sul) {
            sat = JSON.stringify(sul, null, 2);
            bang = util.format(sat);
            if (sat == undefined) {
              bang = util.format(sul);
            }
            return m.reply(bang);
          }
          try {
            m.reply(
              util.format(eval(`(async () => { return ${budy.slice(3)} })()`))
            );
          } catch (e) {
            m.reply(String(e));
          }
        }

        if (budy.startsWith(">")) {
          if (!isCreator) return m.reply(mess.owner);
          try {
            let evaled = await eval(budy.slice(2));
            if (typeof evaled !== "string")
              evaled = require("util").inspect(evaled);
            await m.reply(evaled);
          } catch (err) {
            await m.reply(String(err));
          }
        }

        if (budy.startsWith("$")) {
          if (!isCreator) return m.reply(mess.owner);
          exec(budy.slice(2), (err, stdout) => {
            if (err) return m.reply(err);
            if (stdout) return m.reply(stdout);
          });
        }

        if (m.chat.endsWith("@s.whatsapp.net") && isCmd) {
          this.anonymous = this.anonymous ? this.anonymous : {};
          let room = Object.values(this.anonymous).find(
            (room) =>
              [room.a, room.b].includes(m.sender) && room.state === "CHATTING"
          );
          if (room) {
            if (/^.*(next|leave|start)/.test(m.text)) return;
            if (
              [
                ".next",
                ".leave",
                ".stop",
                ".start",
                "Cari Partner",
                "Keluar",
                "Lanjut",
                "Stop",
              ].includes(m.text)
            )
              return;
            let other = [room.a, room.b].find((user) => user !== m.sender);
            m.copyNForward(
              other,
              true,
              m.quoted && m.quoted.fromMe
                ? {
                    contextInfo: {
                      ...m.msg.contextInfo,
                      forwardingScore: 0,
                      isForwarded: true,
                      participant: other,
                    },
                  }
                : {}
            );
          }
          return !0;
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
