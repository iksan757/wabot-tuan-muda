const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");
const crypto = require("crypto");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const TUAN_MUDA = "11746622b4243c60d6137c218fbadc19";

async function loginSystem() {
    console.clear();
    console.log(chalk.cyan("┌────────────────────────────────────────────────────────┐"));
    console.log(chalk.cyan("│") + chalk.magenta.bold("            SECURITY SYSTEM - TUAN MUDA BOT           ") + chalk.cyan("│"));
    console.log(chalk.cyan("└────────────────────────────────────────────────────────┘"));

    const input = await question(chalk.yellow("🔑 Masukkan Password Akses: "));
    const inputHash = crypto.createHash('md5').update(input).digest('hex');

    if (inputuanmuda === TUAN_MUDA) {
        console.log(chalk.green("\n[!] Akses Diterima. Memulai bot...\n"));
        startBot();
    } else {
        console.log(chalk.red("\n[!] Password Salah! Akses ditolak.\n"));
        process.exit();                                  }
}

function drawDashboard(status, msgCount, lastMsg) {
    console.clear();
    const time = new Date().toLocaleTimeString();
    console.log(chalk.cyan("┌────────────────────────────────────────────────────────┐"));
    console.log(chalk.cyan("│") + chalk.yellow.bold("       TERMINAL MONITORING - TUAN MUDA BOT v1.0       ") + chalk.cyan("│"));
    console.log(chalk.cyan("├────────────────────────────────────────────────────────┤"));                    console.log(chalk.cyan("│") + ` Waktu     : ${time}                                 `.slice(0, 56) + chalk.cyan("│"));
    console.log(chalk.cyan("│") + ` Status    : ${status === 'CONNECTED' ? chalk.green.bold(status) : chalk.red.bold(status)}                    `.slice(0, 65) + chalk.cyan("│"));
    console.log(chalk.cyan("│") + ` Pesan In  : ${chalk.white(msgCount)}                                     `.slice(0, 65) + chalk.cyan("│"));
    console.log(chalk.cyan("├────────────────────────────────────────────────────────┤"));
    console.log(chalk.cyan("│") + chalk.magenta(" [LOG TERAKHIR]                                        ") + chalk.cyan("│"));                                     console.log(chalk.cyan("│") + ` > ${lastMsg.slice(0, 50).padEnd(52)} `.slice(0, 56) + chalk.cyan("│"));
    console.log(chalk.cyan("└────────────────────────────────────────────────────────┘"));
}

let messageCount = 0;
let lastLog = "Menunggu perintah...";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,                            logger: pino({ level: 'silent' }),
        browser: ["Windows", "Chrome", "20.0.04"]        });

    if (!sock.authState.creds.registered) {
        console.clear();
        const phoneNumber = await question(chalk.yellow("Masukkan Nomor WA (Contoh 628xxx): "));
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(chalk.green(`\nKODE PAIRING ANDA: `) + chalk.white.bold.bgBlue(` ${code} `));
    }                                                
    sock.ev.on('creds.update', saveCreds);           
    sock.ev.on('connection.update', (update) => {            const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;                                                               if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            drawDashboard('CONNECTED', messageCount, "Bot Siap Digunakan!");
        }                                                });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;                      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const command = body.toLowerCase().trim();           const args = body.split(" ");

        messageCount++;                                      lastLog = `${from.split('@')[0]}: ${body.slice(0, 20)}`;
        drawDashboard('CONNECTED', messageCount, lastLog);                                                
        if (command === '!menu') {
            const menuText = `🏠 *BOT TUAN MUDA* 🏠\n\n` +
                `*!kirim* [nomor] [teks]\n(Kirim pesan ke orang lain)\n\n` +
                `*!spam* [nomor] [jumlah] [teks]\n(Spam nomor orang lain)\n\n` +
                `*!halo*\n(Cek status bot)`;
            await sock.sendMessage(from, { text: menuText });
        }

        if (command.startsWith('!kirim')) {
            const target = args[1] + "@s.whatsapp.net";
            const teks = args.slice(2).join(" ");
            await sock.sendMessage(target, { text: teks });                                                           await sock.sendMessage(from, { text: "✅ Pesan terkirim ke " + args[1] });
        }
                                                             if (command.startsWith('!spam')) {
            const target = args[1] + "@s.whatsapp.net";
            const jumlah = parseInt(args[2]);
            const teksSpam = args.slice(3).join(" ") || "Pesan Otomatis";
            await sock.sendMessage(from, { text: `🚀 Memulai spam ke ${args[1]} sebanyak ${jumlah}...` });
            for (let i = 0; i < jumlah; i++) {
                await sock.sendMessage(target, { text: teksSpam });
            }
            await sock.sendMessage(from, { text: "✅ Spam Selesai!" });
        }
    });
}
                                                     loginSystem();
  
