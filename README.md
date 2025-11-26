# StudentGear — Fullstack with Firebase Integration

A student marketplace web application with Firebase Authentication, Firestore, Realtime Database, and Storage.

## 🔥 Firebase Integration

This project uses Firebase for:
- **Authentication** - Email/password sign up and sign in
- **Firestore** - Document database for users, products, and carts
- **Realtime Database** - Real-time cart synchronization
- **Storage** - Product images and user avatars

## 📁 Project Structure

```
studentgear/
├── backend/                    # 🖥️ Express.js API Server
│   ├── server.js              # Main server & routes
│   ├── firebase-admin.js      # Firebase Admin SDK
│   └── models.js              # Data models
│
├── frontend/                   # 🎨 Static Frontend
│   ├── index.html             # Single page app
│   ├── css/                   # Stylesheets
│   │   └── animations.css     # SaaS-style animations
│   ├── style.css              # Main styles
│   ├── firebase-config.js     # Firebase client config
│   ├── firebase-auth-ui.js    # Auth UI (login/signup)
│   ├── script.js              # Main app logic
│   └── assets/                # Images
│
├── assets/                     # 📷 Product images
└── README.md                  # Documentation
```

## ✨ SaaS-Style Animations

Premium animations included:
- 🔐 **Login Modal** - Smooth slide-in with glassmorphism effect
- 🛒 **Cart** - Item add/remove animations with bounce effects
- 🔔 **Notifications** - Toast notifications with progress bar
- ⚡ **Buttons** - Ripple effects and hover animations
- 📱 **Responsive** - Mobile-optimized transitions

## 🚀 Getting Started

### Quick Start
```bash
# Clone & run
git clone https://github.com/karthikshetty63/studentgear.git
cd studentgear/backend
npm install
npm start

# Open http://localhost:3000
```

### Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `studentgear-4122f`
3. Enable services:
   - **Authentication** → Sign-in method → Email/Password → Enable
   - **Firestore Database** → Create database → Test mode
   - **Realtime Database** → Create database → Test mode
   - **Storage** → Get started → Test mode

## 📦 Features

| Feature | Status |
|---------|--------|
| Firebase Auth (Email/Password) | ✅ |
| Firestore Database | ✅ |
| Realtime Database | ✅ |
| Firebase Storage | ✅ |
| SaaS Login Animations | ✅ |
| Cart Animations | ✅ |
| Responsive Design | ✅ |

## 📄 API Endpoints

```
GET  /health           # Server status
GET  /products         # List products
POST /auth/login       # Login/Register
GET  /cart             # Get cart items
POST /cart             # Add to cart
PUT  /cart             # Update quantity
DELETE /cart/:name     # Remove item
```

## 🚀 Deployment

**Frontend:** Auto-deploys to GitHub Pages

**Backend:** Deploy to Render.com
```bash
Build: cd backend && npm install
Start: node backend/server.js
```

---
Built for students by students 💙
