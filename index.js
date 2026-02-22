const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");

// --- KONFIGURASI GHAIB ---
// "kansas757" disamarkan dalam bentuk Base64 agar tidak terbaca langsung saat file di-cat/nano
const _0x4a21 = "a2Fuc2FzNzU3";
const getPass = () => Buffer.from(_0x4a21, 'base64').toString('utf-8');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Fungsi Dashboard Premium
function drawDashboard(status, msgCount, lastMsg) {
    console.clear();
    const time = new Date().toLocaleTimeString();
    const border = chalk.magenta("═".repeat(60));

    console.log(chalk.magenta("╔" + border + "╗"));
    console.log(chalk.magenta("║") + chalk.cyan.bold("            SYSTEM MONITOR - TUAN MUDA ELITE v2.0         ") + chalk.magenta("║"));
    console.log(chalk.magenta("╠" + border + "╣"));
    console.log(chalk.magenta("║") + chalk.white(`  🕒 TIME    : ${time}`) .padEnd(61) + chalk.magenta("║"));
    console.log(chalk.magenta("║") + chalk.white(`  🌐 STATUS  : `) + (status === 'CONNECTED' ? chalk.green.bold("● ONLINE") : chalk.red.bold("○ OFFLINE")).padEnd(58) + chalk.magenta("║"));
    console.log(chalk.magenta("║") + chalk.white(`  📩 TRAFFIC : ${chalk.yellow(msgCount + " Messages")}`) .padEnd(69) + chalk.magenta("║"));
    console.log(chalk.magenta("╠" + border + "╣"));
    console.log(chalk.magenta("║") + chalk.blue.bold("  [ RECENT ACTIVITY ]                                     ") + chalk.magenta("║"));
    console.log(chalk.magenta("║") + chalk.gray(`  > ${lastMsg.slice(0, 52).padEnd(54)} `) + chalk.magenta("║"));
    console.log(chalk.magenta("╚" + border + "╝"));
    console.log(chalk.black.bgWhite(" COMMANDS: !menu | !spam | !kirim ") + "\n");
}

let messageCount = 0;
let lastLog = "System initialized...";

async function startBot() {
    console.clear();
    console.log(chalk.red.bold("\n [!] SECURITY CHECK REQUIRED [!]"));

    // LOGIN GHAIB: Password tidak akan muncul saat diketik (Hidden Input)
    const access = await new Promise(resolve => {
        rl.stdoutMuted = true;
        rl.question(chalk.white(" Masukkan Access Key Tuan Muda: "), (pw) => {
            rl.stdoutMuted = false;
            console.log("\n");
            resolve(pw);
        });
        // Trik agar input tidak terlihat di terminal
        rl._writeToOutput = function(string) {
            if (rl.stdoutMuted) rl.output.write("*"); // Diganti bintang agar tetap rahasia
            else rl.output.write(string);
        };
    });

    if (access !== getPass()) {
        console.log(chalk.red.bold("  ❌ ACCESS DENIED: Password Salah. System Shutdown."));
        process.exit();
    }

    console.log(chalk.green(" ✅ ACCESS GRANTED. Membuka enkripsi..."));

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Tuan Muda Bot", "Safari", "1.0.0"]
    });

    // Pairing Code System
    if (!sock.authState.creds.registered) {
        console.log(chalk.blue(" ℹ️ Mempersiapkan Pairing Code..."));
        const phoneNumber = await question(chalk.yellow(" Masukkan Nomor WA (628xxx): "));
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(chalk.black.bgGreen(`\n KODE PAIRING ANDA: ${code} \n`));
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            drawDashboard('CONNECTED', messageCount, "Bot Berhasil Terhubung!");
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const command = body.toLowerCase().trim();
        const args = body.split(" ");

        messageCount++;
        lastLog = `${from.split('@')[0]}: ${body.slice(0, 20)}`;
        drawDashboard('CONNECTED', messageCount, lastLog);

        // --- LOGIKA COMMAND ---
        if (command === '!menu') {
            const menuText = `🔱 *TUAN MUDA DASHBOARD* 🔱\n\n` +
                           `👤 *User:* ${from.split('@')[0]}\n` +
                           `📊 *Traffic:* ${messageCount} msg\n\n` +
                           `*COMMAND LIST:*\n` +
                           `◈ !kirim [nomor] [teks]\n` +
                           `◈ !spam [nomor] [jumlah] [teks]\n` +
                           `◈ !status (Cek kondisi server)`;
            await sock.sendMessage(from, { text: menuText });
        }

        if (command.startsWith('!spam')) {
            const target = args[1] + "@s.whatsapp.net";
            const jumlah = Math.min(parseInt(args[2]), 50); // Maksimal 50 biar nggak kena ban
            const teksSpam = args.slice(3).join(" ") || "Pesan Otomatis Tuan Muda";

            await sock.sendMessage(from, { text: `🚀 Meluncurkan ${jumlah} serangan ke ${args[1]}...` });
            for (let i = 0; i < jumlah; i++) {
                await sock.sendMessage(target, { text: teksSpam });
                await new Promise(r => setTimeout(r, 500)); // Jeda biar nggak gampang ke-ban
            }
            await sock.sendMessage(from, { text: "✅ Misi Selesai, Tuan Muda!" });
        }
    });
}

startBot();
                                                     
