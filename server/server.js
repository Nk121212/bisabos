const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs').promises;
const path = require('path');

// Simpan token di memori (jangan lakukan ini di produksi, gunakan database atau cache)
const tokenStore = {};

// Fungsi untuk menghasilkan token (gunakan JWT di produksi)
function generateToken(username) {
  const timestamp = new Date().getTime();
  // Ini sangat tidak aman. Gunakan JWT di produksi.
  return btoa(username + ':' + timestamp);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Tambahkan Authorization

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  if (path === '/login' && req.method === 'POST') {
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
  } else if (path === '/api/order' && req.method === 'POST') {
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
          const filename = path.join(__dirname, 'json', 'data_order.json'); // Pastikan direktori 'json' ada
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
    // Tangani preflight request untuk CORS
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}/`);
});