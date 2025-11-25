const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');

// Serve frontend static files if present so the website is available at the same host
const frontendDir = path.join(__dirname, '..', 'frontend');
try {
    app.use(express.static(frontendDir));
    // fallback to index.html for SPA routes
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/cart') || req.path.startsWith('/products') || req.path === '/health') return next();
        const indexPath = path.join(frontendDir, 'index.html');
        res.sendFile(indexPath, err => {
            if (err) next();
        });
    });
} catch (e) {
    // ignore if frontend folder isn't present
}

// Models will be assigned to these variables. We provide an in-memory
// fallback so the server can run even when a real MongoDB URI/password
// isn't provided (useful for local testing without secrets). The in-memory
// fallback now persists to simple JSON files under backend/data to make
// local testing less surprising (data survives restarts).
let User, Cart, Product;
let isUsingMongo = false;

const mongooseModels = require('./models');
const fs = require('fs');

function makeInMemoryModels() {
    const dataDir = path.join(__dirname, 'data');
    try { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir); } catch (e) { /* noop */ }

    const usersFile = path.join(dataDir, 'users.json');
    const cartsFile = path.join(dataDir, 'carts.json');
    const productsFile = path.join(dataDir, 'products.json');

    // Load or initialize files
    const readJson = (filePath, fallback) => {
        try {
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(raw || '[]');
            }
        } catch (e) {
            console.warn('Failed to read', filePath, e && e.message);
        }
        return fallback;
    };

    const writeJson = (filePath, data) => {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
            console.error('Failed to write', filePath, e && e.message);
        }
    };

    const users = readJson(usersFile, []);
    class UserModel {
        static async findOne(query) {
            if (!query) return null;
            if (query.email) return users.find(u => u.email === query.email) || null;
            return null;
        }
        static async create(obj) {
            const user = { ...obj, _id: String(users.length + 1), createdAt: new Date() };
            users.push(user);
            writeJson(usersFile, users);
            return user;
        }
    }

    const carts = readJson(cartsFile, []);
    class CartModel {
        constructor(data) { Object.assign(this, data); }
        static async findOne(query) {
            if (!query) return null;
            return carts.find(c => c.token === query.token) || null;
        }
        static async create(obj) {
            const cart = new CartModel(obj);
            carts.push(cart);
            writeJson(cartsFile, carts);
            return cart;
        }
        async save() {
            const idx = carts.findIndex(c => c.token === this.token);
            if (idx >= 0) carts[idx] = this;
            else carts.push(this);
            writeJson(cartsFile, carts);
            return this;
        }
    }

    const products = readJson(productsFile, [
        { name: 'Demo Product', price: 9.99, description: 'Demo product', category: 'demo', image: '', createdAt: new Date() }
    ]);
    class ProductModel {
        static async find() { return products; }
        static async create(obj) { products.push(obj); writeJson(productsFile, products); return obj; }
    }

    return { User: UserModel, Cart: CartModel, Product: ProductModel };
}

function startServer() {
    // Health endpoint reports whether we're using MongoDB or the in-memory fallback
    app.get('/health', (req, res) => {
        const state = {
            mode: isUsingMongo ? 'mongodb' : 'in-memory',
            mongooseReadyState: mongoose && mongoose.connection ? mongoose.connection.readyState : null
        };
        res.json(state);
    });

    // --- Routes ---
    app.get('/', (req, res) => {
        res.json({ ok: true, message: 'StudentGear backend is running' });
    });

    // Products
    app.get('/products', async (req, res) => {
        try {
            const products = await Product.find();
            res.json({ products });
        } catch (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    });

    // Simple demo auth endpoint used by the frontend for login/signup flows.
    // This endpoint works with either the mongoose User model or the in-memory
    // fallback. It does NOT implement secure password handling — it's a
    // lightweight development/demo endpoint. For production, replace with
    // proper hashed passwords and JWTs.
    app.post('/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body || {};
            if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

            let user = await User.findOne({ email });
            if (!user) {
                // create a lightweight user record in whichever model is active
                user = await User.create({ email, name: email.split('@')[0], password });
            }

            // Create a demo token. Frontend accepts any token for demo flows.
            const token = 'demo-token-' + Buffer.from(`${email}:${Date.now()}`).toString('base64');

            res.json({ token, user: { email: user.email, name: user.name || (user.email ? user.email.split('@')[0] : 'user') } });
        } catch (err) {
            console.error('Auth error:', err);
            res.status(500).json({ error: 'Auth failed' });
        }
    });

    // (cart/auth routes remain unchanged and will use the assigned models)

    // Development-only: expose persisted users for quick verification
    app.get('/debug/users', async (req, res) => {
        try {
            const usersFile = path.join(__dirname, 'data', 'users.json');
            if (fs.existsSync(usersFile)) {
                const raw = fs.readFileSync(usersFile, 'utf8') || '[]';
                const list = JSON.parse(raw);
                return res.json({ users: list });
            }

            // If using MongoDB, attempt to read from the User model (dev only)
            if (isUsingMongo && User && typeof User.find === 'function') {
                const docs = await User.find({});
                return res.json({ users: docs });
            }

            return res.json({ users: [] });
        } catch (err) {
            console.error('Debug users error:', err);
            res.status(500).json({ error: 'Failed to read users' });
        }
    });

    // Start server with resilience for EADDRINUSE (port already in use).
    const http = require('http');
    const server = http.createServer(app);

    function tryListen(port, attemptsLeft = 10) {
        server.listen(port);
        server.on('listening', () => {
            console.log(`StudentGear backend listening on http://localhost:${port}`);
            console.log(`Startup mode: ${isUsingMongo ? 'mongodb' : 'in-memory'}`);
            if (isUsingMongo) {
                console.log(`Mongoose readyState: ${mongoose && mongoose.connection ? mongoose.connection.readyState : 'unknown'}`);
            }
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
                console.warn(`Port ${port} in use, trying port ${port + 1} (${attemptsLeft - 1} attempts left)`);
                // remove listeners before retrying to avoid duplicate handlers
                server.removeAllListeners('error');
                server.removeAllListeners('listening');
                setTimeout(() => tryListen(port + 1, attemptsLeft - 1), 200);
                return;
            }
            console.error('Server error:', err);
            process.exit(1);
        });
    }

    const startRetries = parseInt(process.env.START_PORT_RETRIES, 10);
    const attempts = Number.isFinite(startRetries) && startRetries >= 0 ? startRetries : 10;
    tryListen(parseInt(PORT, 10) || 3000, attempts);
}

// Decide whether to use real MongoDB or fall back to in-memory storage
if (!MONGODB_URI || MONGODB_URI.includes('<') || MONGODB_URI.includes('<db_password>')) {
    console.warn('No valid MONGODB_URI found. Using in-memory fallback (not persistent).');
    ({ User, Cart, Product } = makeInMemoryModels());
    startServer();
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
            ({ User, Cart, Product } = mongooseModels);
            startServer();
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
            console.warn('Falling back to in-memory storage (not persistent).');
            ({ User, Cart, Product } = makeInMemoryModels());
            startServer();
        });
}

// The server is started in startServer() above; route handlers are already
// registered there. No further app.listen calls should exist in this file.
