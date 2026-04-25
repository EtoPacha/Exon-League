const { Client, GatewayIntentBits } = require("discord.js");
const db = require("quick.db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";

// BOT AÇILDI
client.on("ready", () => {
  console.log(`${client.user.tag} aktif!`);
});

// MESAJ SİSTEMİ
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // 💰 PARA GÖR
  if (cmd === "para") {
    let para = db.get(`para_${message.author.id}`) || 0;
    let banka = db.get(`bank_${message.author.id}`) || 0;

    message.reply(`💰 Cüzdan: ${para}\n🏦 Banka: ${banka}`);
  }

  // 💸 PARA EKLE (TEST)
  if (cmd === "ekle") {
    let miktar = Number(args[0]);
    if (!miktar) return message.reply("Miktar gir!");

    db.add(`para_${message.author.id}`, miktar);
    message.reply(`${miktar} eklendi 💰`);
  }

  // 🏦 BANKAYA YATIR
  if (cmd === "yatir") {
    let miktar = Number(args[0]);
    if (!miktar) return message.reply("Miktar gir!");

    let para = db.get(`para_${message.author.id}`) || 0;
    if (para < miktar) return message.reply("Yetersiz para!");

    db.subtract(`para_${message.author.id}`, miktar);
    db.add(`bank_${message.author.id}`, miktar);

    message.reply(`${miktar} bankaya yatırıldı 🏦`);
  }

  // 💳 BANKADAN ÇEK
  if (cmd === "cek") {
    let miktar = Number(args[0]);
    if (!miktar) return message.reply("Miktar gir!");

    let banka = db.get(`bank_${message.author.id}`) || 0;
    if (banka < miktar) return message.reply("Bankada para yok!");

    db.subtract(`bank_${message.author.id}`, miktar);
    db.add(`para_${message.author.id}`, miktar);

    message.reply(`${miktar} çekildi 💸`);
  }

  // 😴 AFK
  if (cmd === "afk") {
    let sebep = args.join(" ") || "Sebep yok";
    db.set(`afk_${message.author.id}`, sebep);
    message.reply("AFK oldun 💤");
  }
});

// AFK GERİ DÖNÜŞ
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  let afk = db.get(`afk_${message.author.id}`);
  if (afk) {
    db.delete(`afk_${message.author.id}`);
    message.reply("AFK'dan döndün!");
  }

  message.mentions.users.forEach((user) => {
    let sebep = db.get(`afk_${user.id}`);
    if (sebep) {
      message.reply(`${user.tag} AFK: ${sebep}`);
    }
  });
});
console.log("TOKEN:", process.env.TOKEN);
client.login(process.env.TOKEN);
