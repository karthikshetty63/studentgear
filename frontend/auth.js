// Login functionality
// Use var to allow redeclaration if script.js already defined AUTH_KEY
var AUTH_KEY = AUTH_KEY || 'studentgear_auth';
var API_BASE = window.API_BASE || 'http://localhost:3000';
var isLoggedIn = typeof isLoggedIn !== 'undefined' ? isLoggedIn : false;

// Check login status on page load (handle case where this script is loaded after DOMContentLoaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkLoginStatus());
} else {
    // DOM already ready (scripts injected after load). Run immediately.
    checkLoginStatus();
}

// Check if user is logged in
function checkLoginStatus() {
    const auth = localStorage.getItem(AUTH_KEY);
    isLoggedIn = !!auth;
    updateLoginUI();
    // expose runtime flag for other modules
    window.isLoggedIn = isLoggedIn;
}

// Update login button UI
function updateLoginUI() {
    const loginBtn = document.querySelector('.login-btn');
    if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem(AUTH_KEY));
        loginBtn.textContent = `Hi, ${user.name}`;
        loginBtn.onclick = showUserMenu;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLoginModal;
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-container login-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Login to StudentGear</h3>
                <button class="modal-close" onclick="closeModal(this.closest('.modal-container'))">&times;</button>
            </div>
            <div class="modal-body">
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn-primary">Login</button>
                </form>
                <p class="text-center">
                    <a href="#" onclick="showForgotPassword()">Forgot Password?</a>
                    <span class="mx-2">|</span>
                    <a href="#" onclick="showSignup()">Sign Up</a>
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Make modal visible (buy-modal.css expects .visible to show)
    setTimeout(() => modal.classList.add('visible'), 10);

    // Wire close handlers for backdrop and close button (in case inline onclick isn't used)
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    if (backdrop) backdrop.addEventListener('click', () => closeModal(modal));
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));

    // Close on ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Focus first input for accessibility
    const firstInput = modal.querySelector('input, button, select, textarea');
    if (firstInput) firstInput.focus();
}

// Handle login submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showNotification('Please enter email and password', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showNotification(err.error || 'Login failed', 'error');
            return;
        }

        const data = await res.json();
        // data => { token, user }
        const userObj = {
            name: (data.user && data.user.name) ? data.user.name : email.split('@')[0],
            email: email,
            token: data.token || (data.user && data.user.token) || ('demo-token-' + btoa(email))
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
        isLoggedIn = true;
        window.isLoggedIn = true;
        updateLoginUI();
        closeModal(document.querySelector('.login-modal'));
        showNotification('✅ Logged in successfully!');
    } catch (err) {
        // Network or other error - keep demo fallback
        console.error('Login error', err);
        showNotification('Network error during login — using local demo mode', 'warning');
        const user = { name: email.split('@')[0], email: email, token: 'demo-token' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        isLoggedIn = true;
        window.isLoggedIn = true;
        updateLoginUI();
        closeModal(document.querySelector('.login-modal'));
    }
}

// Show user menu
function showUserMenu() {
    const user = JSON.parse(localStorage.getItem(AUTH_KEY));
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <ul>
            <li onclick="viewProfile()">Profile</li>
            <li onclick="viewOrders()">Orders</li>
            <li onclick="viewWishlist()">Wishlist</li>
            <li onclick="logout()">Logout</li>
        </ul>
    `;
    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !document.querySelector('.login-btn').contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_KEY);
    isLoggedIn = false;
    updateLoginUI();
    showNotification('👋 Logged out successfully!');
}

// Helper function to close modals
function closeModal(modal) {
    if (!modal) return;
    // animate out using classes defined in buy-modal.css
    modal.classList.remove('visible');
    modal.classList.add('closing');
    setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 300);
}

// Show signup modal
function showSignup() {
    const modal = document.createElement('div');
    modal.className = 'modal-container signup-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create an account</h3>
                <button class="modal-close" onclick="closeModal(this.closest('.modal-container'))">&times;</button>
            </div>
            <div class="modal-body">
                <form id="signupForm" onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label for="signupName">Full name</label>
                        <input type="text" id="signupName" required>
                    </div>
                    <div class="form-group">
                        <label for="signupEmail">Email</label>
                        <input type="email" id="signupEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" required>
                    </div>
                    <button type="submit" class="btn-primary">Create account</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('visible'), 10);
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    if (backdrop) backdrop.addEventListener('click', () => closeModal(modal));
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    const firstInput = modal.querySelector('input, button, select, textarea');
    if (firstInput) firstInput.focus();
}

// Handle signup submission — for this demo the server auto-creates users on /auth/login, so reuse that endpoint.
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) {
        showNotification('Please fill all fields', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showNotification(err.error || 'Signup failed', 'error');
            return;
        }
        const data = await res.json();
        const userObj = {
            name: name,
            email: email,
            token: data.token || ('demo-token-' + btoa(email))
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
        isLoggedIn = true;
        window.isLoggedIn = true;
        updateLoginUI();
        closeModal(document.querySelector('.signup-modal'));
        showNotification('✅ Account created and logged in');
    } catch (err) {
        console.error('Signup error', err);
        showNotification('Network error during signup — please try again', 'error');
    }
}

// Simple forgot password placeholder
function showForgotPassword() {
    const modal = document.createElement('div');
    modal.className = 'modal-container forgot-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reset password</h3>
                <button class="modal-close" onclick="closeModal(this.closest('.modal-container'))">&times;</button>
            </div>
            <div class="modal-body">
                <p>Enter your email and we'll send a reset link (demo only).</p>
                <form onsubmit="event.preventDefault(); closeModal(this.closest('.modal-container')); showNotification('If this were real, a reset link would be sent.');">
                    <div class="form-group">
                        <label for="fpEmail">Email</label>
                        <input type="email" id="fpEmail" required>
                    </div>
                    <button type="submit" class="btn-primary">Send reset link</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('visible'), 10);
}