const http = require('http');
const payload = JSON.stringify({ email: 'autotest_script_' + Date.now() + '@example.com', password: 'pw' });
const opts = {
    hostname: 'localhost',
    port: 3000,
    method: 'POST',
    path: '/auth/login',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    timeout: 5000
};

const req = http.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log('STATUS', res.statusCode);
        console.log('BODY', d);
    });
});
req.on('error', e => console.error('ERR', e && e.message));
req.write(payload);
req.end();
