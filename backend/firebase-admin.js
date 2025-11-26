// Firebase Admin SDK Configuration for Backend
// This file initializes Firebase Admin for server-side operations

const admin = require('firebase-admin');

// Firebase project configuration
// For production, use a service account key file
const firebaseConfig = {
    projectId: "studentgear-4122f",
    storageBucket: "studentgear-4122f.firebasestorage.app",
    databaseURL: "https://studentgear-4122f-default-rtdb.firebaseio.com"
};

let firebaseAdmin = null;
let firestore = null;
let realtimeDb = null;
let storage = null;
let auth = null;

/**
 * Initialize Firebase Admin SDK
 * @param {Object} serviceAccount - Optional service account credentials
 * @returns {boolean} - Whether initialization was successful
 */
function initializeFirebaseAdmin(serviceAccount = null) {
    try {
        if (admin.apps.length > 0) {
            firebaseAdmin = admin.app();
        } else if (serviceAccount) {
            // Initialize with service account (production)
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                ...firebaseConfig
            });
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Initialize with environment variable pointing to service account file
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                ...firebaseConfig
            });
        } else {
            // Initialize without credentials (limited functionality)
            // This works for Firestore/RTDB if rules allow public access
            console.warn('Firebase Admin initialized without credentials. Some features may be limited.');
            firebaseAdmin = admin.initializeApp(firebaseConfig);
        }

        // Initialize services
        firestore = admin.firestore();
        realtimeDb = admin.database();
        storage = admin.storage();
        auth = admin.auth();

        console.log('✅ Firebase Admin SDK initialized');
        return true;
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        return false;
    }
}

/**
 * Verify Firebase ID token from client
 * @param {string} idToken - The Firebase ID token
 * @returns {Object|null} - Decoded token or null
 */
async function verifyIdToken(idToken) {
    if (!auth) return null;
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Token verification error:', error.message);
        return null;
    }
}

/**
 * Get user by UID
 * @param {string} uid - User ID
 * @returns {Object|null} - User record or null
 */
async function getUser(uid) {
    if (!auth) return null;
    try {
        return await auth.getUser(uid);
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
}

// Firestore operations
const FirestoreOperations = {
    // Get document
    async getDoc(collection, docId) {
        if (!firestore) return null;
        try {
            const doc = await firestore.collection(collection).doc(docId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Firestore get doc error:', error.message);
            return null;
        }
    },

    // Set document
    async setDoc(collection, docId, data, merge = true) {
        if (!firestore) return false;
        try {
            await firestore.collection(collection).doc(docId).set(data, { merge });
            return true;
        } catch (error) {
            console.error('Firestore set doc error:', error.message);
            return false;
        }
    },

    // Update document
    async updateDoc(collection, docId, data) {
        if (!firestore) return false;
        try {
            await firestore.collection(collection).doc(docId).update(data);
            return true;
        } catch (error) {
            console.error('Firestore update doc error:', error.message);
            return false;
        }
    },

    // Delete document
    async deleteDoc(collection, docId) {
        if (!firestore) return false;
        try {
            await firestore.collection(collection).doc(docId).delete();
            return true;
        } catch (error) {
            console.error('Firestore delete doc error:', error.message);
            return false;
        }
    },

    // Query collection
    async queryCollection(collection, conditions = []) {
        if (!firestore) return [];
        try {
            let query = firestore.collection(collection);
            conditions.forEach(({ field, operator, value }) => {
                query = query.where(field, operator, value);
            });
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Firestore query error:', error.message);
            return [];
        }
    },

    // Get all documents in collection
    async getAllDocs(collection) {
        if (!firestore) return [];
        try {
            const snapshot = await firestore.collection(collection).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Firestore get all docs error:', error.message);
            return [];
        }
    },

    // Add document with auto-generated ID
    async addDoc(collection, data) {
        if (!firestore) return null;
        try {
            const docRef = await firestore.collection(collection).add({
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Firestore add doc error:', error.message);
            return null;
        }
    }
};

// Realtime Database operations
const RealtimeDbOperations = {
    // Get data
    async getData(path) {
        if (!realtimeDb) return null;
        try {
            const snapshot = await realtimeDb.ref(path).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('RTDB get error:', error.message);
            return null;
        }
    },

    // Set data
    async setData(path, data) {
        if (!realtimeDb) return false;
        try {
            await realtimeDb.ref(path).set(data);
            return true;
        } catch (error) {
            console.error('RTDB set error:', error.message);
            return false;
        }
    },

    // Update data
    async updateData(path, data) {
        if (!realtimeDb) return false;
        try {
            await realtimeDb.ref(path).update(data);
            return true;
        } catch (error) {
            console.error('RTDB update error:', error.message);
            return false;
        }
    },

    // Delete data
    async deleteData(path) {
        if (!realtimeDb) return false;
        try {
            await realtimeDb.ref(path).remove();
            return true;
        } catch (error) {
            console.error('RTDB delete error:', error.message);
            return false;
        }
    },

    // Push data (add to list with auto-generated key)
    async pushData(path, data) {
        if (!realtimeDb) return null;
        try {
            const ref = await realtimeDb.ref(path).push(data);
            return ref.key;
        } catch (error) {
            console.error('RTDB push error:', error.message);
            return null;
        }
    }
};

// Storage operations
const StorageOperations = {
    // Get download URL
    async getDownloadUrl(filePath) {
        if (!storage) return null;
        try {
            const bucket = storage.bucket();
            const file = bucket.file(filePath);
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            return url;
        } catch (error) {
            console.error('Storage get URL error:', error.message);
            return null;
        }
    },

    // Delete file
    async deleteFile(filePath) {
        if (!storage) return false;
        try {
            const bucket = storage.bucket();
            await bucket.file(filePath).delete();
            return true;
        } catch (error) {
            console.error('Storage delete error:', error.message);
            return false;
        }
    }
};

module.exports = {
    initializeFirebaseAdmin,
    verifyIdToken,
    getUser,
    FirestoreOperations,
    RealtimeDbOperations,
    StorageOperations,
    getFirestore: () => firestore,
    getRealtimeDb: () => realtimeDb,
    getStorage: () => storage,
    getAuth: () => auth
};
