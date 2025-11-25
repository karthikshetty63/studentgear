const http = require('http');

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function run() {
    const host = 'localhost';
    const port = 3000;
    const payload = JSON.stringify({ email: `autotest+${Date.now()}@example.com`, password: 'pw' });

    try {
        const a = await request({ method: 'POST', host, port, path: '/auth/login', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, payload);
        console.log('/auth/login', a.statusCode, a.body);
    } catch (err) {
        console.error('/auth/login error', err && err.stack ? err.stack : err);
    }

    try {
        const b = await request({ method: 'GET', host, port, path: '/debug/users' });
        console.log('/debug/users', b.statusCode, b.body);
    } catch (err) {
        console.error('/debug/users error', err && err.stack ? err.stack : err);
    }
}

run();
