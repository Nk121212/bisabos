const querystring = require('querystring');

// Simpan token di memori (jangan lakukan ini di produksi, gunakan database atau cache)
const tokenStore = {};

// Fungsi untuk menghasilkan token (gunakan JWT di produksi)
function generateToken(username) {
    const timestamp = new Date().getTime();
    // Ini sangat tidak aman. Gunakan JWT di produksi.
    return btoa(username + ':' + timestamp);
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
        body += chunk.toString();
        });

        req.on('end', () => {
        const formData = querystring.parse(body);
        const { username, password } = formData;

        console.log('Login attempt:', username, password);

        if (username === 'demo' && password === 'password') {
            // Generate Token
            const token = generateToken(username);
            tokenStore[token] = { username: username }; // Simpan token (di memori - INSECURE)

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Kirimkan token sebagai Bearer
            });
            res.end(JSON.stringify({ success: true, message: 'Login berhasil!', token: token })); // Kirim juga di body
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Login gagal. Periksa username dan password Anda.' }));
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