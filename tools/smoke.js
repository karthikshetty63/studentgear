const http = require('http')

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let data = ''
            res.setEncoding('utf8')
            res.on('data', chunk => data += chunk)
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }))
        })
        req.on('error', reject)
        if (body) req.write(body)
        req.end()
    })
}

async function run() {
    const host = 'localhost'
    const port = 3006
    const base = `http://${host}:${port}`
    console.log('Testing backend at', base)

    try {
        const h = await request({ method: 'GET', host, port, path: '/health' })
        console.log('/health', h.statusCode)
        console.log(h.body)
    } catch (err) {
        console.error('/health error', err && err.stack ? err.stack : err)
    }

    try {
        const r = await request({ method: 'GET', host, port, path: '/' })
        console.log('/ ->', r.statusCode)
        console.log(r.body)
    } catch (err) {
        console.error('/ error', err && err.stack ? err.stack : err)
    }

    try {
        const p = await request({ method: 'GET', host, port, path: '/products' })
        console.log('/products', p.statusCode)
        console.log(p.body)
    } catch (err) {
        console.error('/products error', err && err.stack ? err.stack : err)
    }

    try {
        const payload = JSON.stringify({ username: 'test', password: 'test' })
        const a = await request({ method: 'POST', host, port, path: '/auth/login', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, payload)
        console.log('/auth/login', a.statusCode)
        console.log(a.body)
    } catch (err) {
        console.error('/auth/login error', err && err.stack ? err.stack : err)
    }
}

run()
