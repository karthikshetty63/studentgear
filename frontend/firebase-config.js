// Firebase Configuration for StudentGear
// This file initializes Firebase services for the frontend

const firebaseConfig = {
    apiKey: "AIzaSyBz52yzFrEJaUDP_KE1Hxm5Zg6Ir9fijyE",
    authDomain: "studentgear-4122f.firebaseapp.com",
    projectId: "studentgear-4122f",
    storageBucket: "studentgear-4122f.firebasestorage.app",
    messagingSenderId: "78212517106",
    appId: "1:78212517106:web:78795ae4cae6aa60b1546b",
    measurementId: "G-NLYMVR0PHQ",
    databaseURL: "https://studentgear-4122f-default-rtdb.firebaseio.com"
};

// Initialize Firebase (will be done after SDK loads)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;
let firebaseRealtimeDb = null;

// Initialize Firebase when SDK is loaded
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded yet');
        return false;
    }

    try {
        // Initialize Firebase App
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            firebaseApp = firebase.app();
        }

        // Initialize Firebase Auth
        firebaseAuth = firebase.auth();
        
        // Initialize Firestore
        firebaseDb = firebase.firestore();
        
        // Initialize Realtime Database
        firebaseRealtimeDb = firebase.database();
        
        // Initialize Storage
        firebaseStorage = firebase.storage();

        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

// Auth helper functions
const FirebaseAuthService = {
    // Sign up with email and password
    async signUp(email, password, displayName) {
        try {
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update display name
            if (displayName) {
                await user.updateProfile({ displayName });
            }
            
            // Create user document in Firestore
            await firebaseDb.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: displayName || email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                cart: []
            });
            
            return { success: true, user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out
    async signOut() {
        try {
            await firebaseAuth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser() {
        return firebaseAuth ? firebaseAuth.currentUser : null;
    },

    // Listen for auth state changes
    onAuthStateChanged(callback) {
        if (firebaseAuth) {
            return firebaseAuth.onAuthStateChanged(callback);
        }
        return () => {};
    },

    // Get ID token for API calls
    async getIdToken() {
        const user = this.getCurrentUser();
        if (user) {
            return await user.getIdToken();
        }
        return null;
    }
};

// Firestore helper functions
const FirestoreService = {
    // Get user's cart
    async getCart(userId) {
        try {
            const doc = await firebaseDb.collection('carts').doc(userId).get();
            if (doc.exists) {
                return doc.data().items || [];
            }
            return [];
        } catch (error) {
            console.error('Get cart error:', error);
            return [];
        }
    },

    // Update cart
    async updateCart(userId, items) {
        try {
            await firebaseDb.collection('carts').doc(userId).set({
                items,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Update cart error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get products
    async getProducts(category = null) {
        try {
            let query = firebaseDb.collection('products');
            if (category) {
                query = query.where('category', '==', category);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Get products error:', error);
            return [];
        }
    },

    // Add product (admin)
    async addProduct(product) {
        try {
            const docRef = await firebaseDb.collection('products').add({
                ...product,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Add product error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            const doc = await firebaseDb.collection('users').doc(userId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    },

    // Update user profile
    async updateUserProfile(userId, data) {
        try {
            await firebaseDb.collection('users').doc(userId).update(data);
            return { success: true };
        } catch (error) {
            console.error('Update user profile error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Realtime Database helper functions
const RealtimeDbService = {
    // Get real-time cart updates
    subscribeToCart(userId, callback) {
        const cartRef = firebaseRealtimeDb.ref(`carts/${userId}`);
        cartRef.on('value', (snapshot) => {
            const data = snapshot.val();
            callback(data ? data.items || [] : []);
        });
        return () => cartRef.off('value');
    },

    // Update cart in realtime
    async updateCart(userId, items) {
        try {
            await firebaseRealtimeDb.ref(`carts/${userId}`).set({
                items,
                updatedAt: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Realtime DB update cart error:', error);
            return { success: false, error: error.message };
        }
    },

    // Subscribe to product updates
    subscribeToProducts(callback) {
        const productsRef = firebaseRealtimeDb.ref('products');
        productsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            const products = data ? Object.entries(data).map(([id, product]) => ({ id, ...product })) : [];
            callback(products);
        });
        return () => productsRef.off('value');
    }
};

// Storage helper functions
const StorageService = {
    // Upload product image
    async uploadProductImage(file, productId) {
        try {
            const storageRef = firebaseStorage.ref(`products/${productId}/${file.name}`);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('Upload image error:', error);
            return { success: false, error: error.message };
        }
    },

    // Upload user avatar
    async uploadUserAvatar(file, userId) {
        try {
            const storageRef = firebaseStorage.ref(`avatars/${userId}/${file.name}`);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('Upload avatar error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete file
    async deleteFile(filePath) {
        try {
            const storageRef = firebaseStorage.ref(filePath);
            await storageRef.delete();
            return { success: true };
        } catch (error) {
            console.error('Delete file error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export for use in other files
window.FirebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.FirebaseAuthService = FirebaseAuthService;
window.FirestoreService = FirestoreService;
window.RealtimeDbService = RealtimeDbService;
window.StorageService = StorageService;
