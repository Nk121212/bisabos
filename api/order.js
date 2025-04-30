const fs = require('fs').promises;
const path = require('path');

// Simpan token di memori (jangan lakukan ini di produksi, gunakan database atau cache)
const tokenStore = {}; // Pastikan ini sinkron dengan login.js jika Anda tidak menggunakan database

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', async () => {
        try {
        const newData = JSON.parse(body);
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'error', message: 'Token otentikasi tidak ditemukan.' }));
        }

        const token = authHeader.split(' ')[1];

        if (!tokenStore[token]) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'error', message: 'Token tidak valid atau kedaluwarsa.' }));
        }

        if (newData && newData.ktp) {
            const filename = path.join(__dirname, '..', 'json', 'data_order.json'); // Sesuaikan path
            let existingData = [];
            let isReplaced = false;

            try {
            const fileContent = await fs.readFile(filename, 'utf8');
            existingData = JSON.parse(fileContent);
            if (!Array.isArray(existingData)) {
                existingData = [];
            }

            for (let i = 0; i < existingData.length; i++) {
                if (existingData[i].ktp === newData.ktp) {
                existingData[i] = newData;
                isReplaced = true;
                break;
                }
            }
            } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Gagal membaca file:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ status: 'error', message: 'Gagal membaca file data.' }));
            }
            }

            if (!isReplaced) {
                existingData.push(newData);
            }

            await fs.writeFile(filename, JSON.stringify(existingData, null, 2), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success', message: isReplaced ? 'Data order berhasil diperbarui.' : 'Data order berhasil disimpan.' }));
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Data JSON tidak valid atau KTP tidak ditemukan.' }));
        }
        } catch (error) {
            console.error('Gagal memproses request:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Data JSON tidak valid.' }));
        }
    });
    } else if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
};