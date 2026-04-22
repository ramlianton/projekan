// backend/src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inisialisasi client dengan LocalAuth agar sesi tersimpan (tidak perlu scan QR berkali-kali)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Mencegah error pada beberapa sistem operasi
    }
});

// Menampilkan QR Code di terminal saat pertama kali dijalankan
client.on('qr', (qr) => {
    console.log('📱 Scan QR Code ini dengan aplikasi WhatsApp Anda (Linked Devices):');
    qrcode.generate(qr, { small: true });
});

// Indikator jika bot sudah siap
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is READY and Connected!');
});

// Mulai jalankan bot
client.initialize();

// Fungsi untuk mengirim pesan
const sendMessage = async (phoneNumber, message) => {
    try {
        if (!phoneNumber) return false;

        // Format nomor HP lokal ke format internasional WA (0812... -> 62812...@c.us)
        let formattedNumber = phoneNumber.toString();
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.slice(1);
        }
        formattedNumber = `${formattedNumber}@c.us`;

        await client.sendMessage(formattedNumber, message);
        console.log(`[WA BOT] Pesan berhasil terkirim ke ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error(`[WA BOT] Gagal mengirim pesan ke ${phoneNumber}:`, error.message);
        return false;
    }
};

module.exports = { client, sendMessage };