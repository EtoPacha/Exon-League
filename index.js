const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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
client.once("ready", () => {
  console.log(`${client.user.tag} aktif!`);
});

// MESAJ SİSTEMİ
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // =========================
  // 💼 BAKİYE KOMUTU
  // =========================
  if (cmd === "bakiye") {

    let user = message.author;

    let cüzdan = db.get(`money_${user.id}`) || 0;
    let banka = db.get(`bank_${user.id}`) || 0;
    let toplam = cüzdan + banka;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("💼 Bakiye Bilgisi")
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "👤 Kullanıcı", value: user.username, inline: false },
        { name: "👛 Cüzdan", value: `${cüzdan.toLocaleString()} €`, inline: true },
        { name: "🏦 Banka", value: `${banka.toLocaleString()} €`, inline: true },
        { name: "💰 Toplam", value: `${toplam.toLocaleString()} €`, inline: false }
      )
      .setFooter({ text: "Ekonomi Sistemi" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // =========================
  // 💸 PARA EKLE (TEST)
  // =========================
  if (cmd === "paraekle") {
    let miktar = Number(args[0]);
    if (!miktar) return message.reply("Miktar gir!");

    db.add(`money_${message.author.id}`, miktar);
    message.reply(`${miktar} € eklendi!`);
  }

  // =========================
  // 🏦 BANKAYA YATIR
  // =========================
  if (cmd === "yatir") {
    let miktar = Number(args[0]);
    if (!miktar) return message.reply("Miktar gir!");

    let para = db.get(`money_${message.author.id}`) || 0;
    if (para < miktar) return message.reply("Yeterli paran yok!");

    db.subtract(`money_${message.author.id}`, miktar);
    db.add(`bank_${message.author.id}`, miktar);

    message.reply(`${miktar} € bankaya yatırıldı!`);
  }

  // =========================
  // 💰 BANKADAN ÇEK
  // =========================
  if (cmd === "çek") {
    let miktar = Number(args[0]);
    if (!miktar) return message.reply("Miktar gir!");

    let banka = db.get(`bank_${message.author.id}`) || 0;
    if (banka < miktar) return message.reply("Bankada yeterli para yok!");

    db.subtract(`bank_${message.author.id}`, miktar);
    db.add(`money_${message.author.id}`, miktar);

    message.reply(`${miktar} € çekildi!`);
  }

  // =========================
  // 💤 AFK
  // =========================
  if (cmd === "afk") {
    let sebep = args.join(" ") || "Sebep yok";
    db.set(`afk_${message.author.id}`, sebep);
    message.reply("AFK oldun!");
  }

});

client.login(process.env.TOKEN);
