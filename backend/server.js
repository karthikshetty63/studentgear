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
let isUsingFirebase = false;

const firebaseAdmin = require('./firebase-admin');
const fs = require('fs');

// simple HTML escape helper for admin UI
function escapeHtml(str) {
    if (str === null || typeof str === 'undefined') return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
function makeFirestoreModels() {
    const { FirestoreOperations } = firebaseAdmin;

    class UserModel {
        static async findOne(query) {
            if (!query) return null;
            if (query.email) {
                const users = await FirestoreOperations.queryCollection('users', [{ field: 'email', operator: '==', value: query.email }]);
                return users.length ? users[0] : null;
            }
            if (query._id) {
                const doc = await FirestoreOperations.getDoc('users', query._id);
                return doc;
            }
            return null;
        }
        static async create(obj) {
            const id = await FirestoreOperations.addDoc('users', obj);
            if (!id) return null;
            const created = await FirestoreOperations.getDoc('users', id);
            return created;
        }
    }

    class CartModel {
        constructor(data) { Object.assign(this, data); }
        static async findOne(query) {
            if (!query) return null;
            if (query.token) {
                const carts = await FirestoreOperations.queryCollection('carts', [{ field: 'token', operator: '==', value: query.token }]);
                return carts.length ? carts[0] : null;
            }
            return null;
        }
        static async create(obj) {
            const id = await FirestoreOperations.addDoc('carts', obj);
            const created = id ? await FirestoreOperations.getDoc('carts', id) : obj;
            return created;
        }
        async save() {
            try {
                if (this.id) {
                    await FirestoreOperations.updateDoc('carts', this.id, this);
                    return this;
                }
                // Try to find by token and update, else create
                const existing = await CartModel.findOne({ token: this.token });
                if (existing && existing.id) {
                    await FirestoreOperations.updateDoc('carts', existing.id, this);
                    return this;
                }
                const id = await FirestoreOperations.addDoc('carts', this);
                if (id) this.id = id;
                return this;
            } catch (e) {
                console.error('Cart save error:', e && e.message);
                return this;
            }
        }
    }

    class ProductModel {
        static async find() { return await FirestoreOperations.getAllDocs('products'); }
        static async create(obj) { const id = await FirestoreOperations.addDoc('products', obj); return id ? { id, ...obj } : obj; }
    }

    return { User: UserModel, Cart: CartModel, Product: ProductModel };
}

function startServer() {
    // Health endpoint reports whether we're using MongoDB or the in-memory fallback
    app.get('/health', (req, res) => {
        const state = {
            mode: isUsingFirebase ? 'firebase' : 'in-memory',
            firestoreAvailable: !!firebaseAdmin.getFirestore()
        };
        res.json(state);
    });

    // Authenticated webhook to receive contact messages from frontend and store via Firebase Admin
    app.post('/api/contact', async (req, res) => {
        try {
            const { name, email, subject, message } = req.body || {};
            // Basic server-side validation
            if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required' });
            if (typeof name !== 'string' || name.length > 200) return res.status(400).json({ error: 'Invalid name' });
            if (typeof email !== 'string' || email.length > 200) return res.status(400).json({ error: 'Invalid email' });
            if (typeof message !== 'string' || message.length > 5000) return res.status(400).json({ error: 'Invalid message' });

            // Require Firebase ID token in Authorization header
            const authHeader = req.headers.authorization || req.headers['x-auth-token'];
            if (!authHeader) return res.status(401).json({ error: 'Authorization token required' });
            const token = (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

            // Verify token using firebase-admin helper
            const decoded = await firebaseAdmin.verifyIdToken(token);
            if (!decoded) return res.status(401).json({ error: 'Invalid token' });

            // Save to Firestore using admin helper if available
            try {
                const { FirestoreOperations } = firebaseAdmin;
                const payload = {
                    name,
                    email,
                    subject: subject || null,
                    message,
                    userUid: decoded.uid || null,
                    createdAt: new Date().toISOString()
                };
                const id = await FirestoreOperations.addDoc('contactMessages', payload);
                return res.json({ success: true, id });
            } catch (err) {
                console.error('Failed to write contact to Firestore:', err && err.message);
                return res.status(500).json({ error: 'Failed to save message' });
            }
        } catch (err) {
            console.error('Contact webhook error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Dev-only admin UI to list submitted contact messages (reads from Firestore or in-memory file)
    app.get('/admin/contacts', async (req, res) => {
        try {
            // Access control: if ADMIN_KEY is set require header x-admin-key to match; otherwise allow in non-production
            const adminKey = process.env.ADMIN_KEY;
            if (adminKey) {
                const provided = req.headers['x-admin-key'];
                if (!provided || provided !== adminKey) return res.status(403).send('Forbidden');
            } else if (process.env.NODE_ENV === 'production') {
                return res.status(403).send('Forbidden');
            }

            // Try Firestore first
            if (isUsingFirebase && firebaseAdmin && firebaseAdmin.FirestoreOperations) {
                const docs = await firebaseAdmin.FirestoreOperations.getAllDocs('contactMessages');
                // Render a minimal HTML table for dev
                let html = '<!doctype html><html><head><meta charset="utf-8"><title>Contacts</title></head><body><h1>Contact Messages</h1><table border="1" cellpadding="8"><tr><th>Created</th><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>UserUid</th></tr>';
                docs.forEach(d => {
                    html += `<tr><td>${d.createdAt || ''}</td><td>${escapeHtml(d.name || '')}</td><td>${escapeHtml(d.email || '')}</td><td>${escapeHtml(d.subject || '')}</td><td>${escapeHtml(d.message || '')}</td><td>${escapeHtml(d.userUid || '')}</td></tr>`;
                });
                html += '</table></body></html>';
                res.send(html);
                return;
            }

            // Fallback: read persisted file if present
            const contactsFile = path.join(__dirname, 'data', 'contactMessages.json');
            if (fs.existsSync(contactsFile)) {
                const raw = fs.readFileSync(contactsFile, 'utf8') || '[]';
                const list = JSON.parse(raw);
                return res.json({ contacts: list });
            }

            return res.json({ contacts: [] });
        } catch (err) {
            console.error('Admin contacts error:', err);
            res.status(500).send('Server error');
        }
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

    // Cart API endpoints - require x-auth-token header for user identification
    // Helper to find/create cart by token
    async function getOrCreateCart(token) {
        let cart = await Cart.findOne({ token });
        if (!cart) {
            cart = await Cart.create({ token, items: [] });
        }
        return cart;
    }

    // GET /cart - fetch user's cart
    app.get('/cart', async (req, res) => {
        try {
            const token = req.headers['x-auth-token'];
            if (!token) return res.status(401).json({ error: 'Token required' });

            const cart = await getOrCreateCart(token);
            res.json({ cart: cart.items || [] });
        } catch (err) {
            console.error('Get cart error:', err);
            res.status(500).json({ error: 'Failed to fetch cart' });
        }
    });

    // POST /cart - add item to cart
    app.post('/cart', async (req, res) => {
        try {
            const token = req.headers['x-auth-token'];
            if (!token) return res.status(401).json({ error: 'Token required' });

            const { item } = req.body || {};
            if (!item || !item.name) return res.status(400).json({ error: 'Item with name required' });
            // Validate item name - must be non-empty string with reasonable length
            if (typeof item.name !== 'string' || item.name.length > 200) {
                return res.status(400).json({ error: 'Invalid item name' });
            }

            const cart = await getOrCreateCart(token);
            const existing = cart.items.find(i => i.name === item.name);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.items.push({ ...item, quantity: item.quantity || 1 });
            }
            cart.updatedAt = new Date();
            await cart.save();

            res.json({ cart: cart.items });
        } catch (err) {
            console.error('Add to cart error:', err);
            res.status(500).json({ error: 'Failed to add to cart' });
        }
    });

    // PUT /cart - update item quantity
    app.put('/cart', async (req, res) => {
        try {
            const token = req.headers['x-auth-token'];
            if (!token) return res.status(401).json({ error: 'Token required' });

            const { name, quantity } = req.body || {};
            if (!name) return res.status(400).json({ error: 'Item name required' });
            // Validate item name - must be non-empty string with reasonable length
            if (typeof name !== 'string' || name.length > 200) {
                return res.status(400).json({ error: 'Invalid item name' });
            }

            const cart = await getOrCreateCart(token);
            const item = cart.items.find(i => i.name === name);
            if (!item) return res.status(404).json({ error: 'Item not found in cart' });

            if (quantity <= 0) {
                cart.items = cart.items.filter(i => i.name !== name);
            } else {
                item.quantity = quantity;
            }
            cart.updatedAt = new Date();
            await cart.save();

            res.json({ cart: cart.items });
        } catch (err) {
            console.error('Update cart error:', err);
            res.status(500).json({ error: 'Failed to update cart' });
        }
    });

    // DELETE /cart/:name - remove item from cart
    app.delete('/cart/:name', async (req, res) => {
        try {
            const token = req.headers['x-auth-token'];
            if (!token) return res.status(401).json({ error: 'Token required' });

            const name = decodeURIComponent(req.params.name);
            // Validate item name - must be non-empty string with reasonable length
            if (!name || typeof name !== 'string' || name.length > 200) {
                return res.status(400).json({ error: 'Invalid item name' });
            }

            const cart = await getOrCreateCart(token);
            cart.items = cart.items.filter(i => i.name !== name);
            cart.updatedAt = new Date();
            await cart.save();

            res.json({ cart: cart.items });
        } catch (err) {
            console.error('Remove from cart error:', err);
            res.status(500).json({ error: 'Failed to remove from cart' });
        }
    });

    // Development-only: expose persisted users for quick verification
    app.get('/debug/users', async (req, res) => {
        try {
            const usersFile = path.join(__dirname, 'data', 'users.json');
            if (fs.existsSync(usersFile)) {
                const raw = fs.readFileSync(usersFile, 'utf8') || '[]';
                const list = JSON.parse(raw);
                return res.json({ users: list });
            }

            // If using Firebase, attempt to read users from Firestore (dev only)
            if (isUsingFirebase && firebaseAdmin && typeof firebaseAdmin.FirestoreOperations !== 'undefined') {
                try {
                    const docs = await firebaseAdmin.FirestoreOperations.getAllDocs('users');
                    return res.json({ users: docs });
                } catch (e) {
                    console.warn('Failed to read users from Firestore', e && e.message);
                }
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
            console.log(`Startup mode: ${isUsingFirebase ? 'firebase' : 'in-memory'}`);
            if (isUsingFirebase) {
                try {
                    const ready = !!firebaseAdmin.getFirestore();
                    console.log(`Firestore available: ${ready}`);
                } catch (e) {
                    console.log('Firestore available: unknown');
                }
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

// Initialize Firebase Admin and use Firestore-backed models. Fall back to in-memory models if initialization fails.
try {
    // Allow providing a service account via an env var to avoid writing files to disk.
    // Supported options (priority):
    // 1) `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file (handled by firebase-admin)
    // 2) `FIREBASE_SERVICE_ACCOUNT_JSON` containing raw JSON or base64-encoded JSON of the service account
    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
        try {
            if (raw.startsWith('{')) {
                serviceAccount = JSON.parse(raw);
            } else {
                // treat as base64
                const decoded = Buffer.from(raw, 'base64').toString('utf8');
                serviceAccount = JSON.parse(decoded);
            }
            console.log('Using service account from FIREBASE_SERVICE_ACCOUNT_JSON env var');
        } catch (e) {
            console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON; falling back to application-default credentials');
            serviceAccount = null;
        }
    }

    const ok = firebaseAdmin.initializeFirebaseAdmin(serviceAccount);
    if (ok) {
        ({ User, Cart, Product } = makeFirestoreModels());
        isUsingFirebase = true;
        console.log('Using Firestore for data storage');
    } else {
        console.warn('Firebase Admin failed to initialize; using in-memory fallback');
        ({ User, Cart, Product } = makeInMemoryModels());
    }
} catch (err) {
    console.error('Firebase initialization error:', err && err.message);
    ({ User, Cart, Product } = makeInMemoryModels());
}

startServer();

// The server is started in startServer() above; route handlers are already
// registered there. No further app.listen calls should exist in this file.
