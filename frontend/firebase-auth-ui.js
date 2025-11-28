// Firebase Auth UI Integration
// This file handles the UI integration for Firebase Authentication

(function () {
    // Wait for Firebase to be initialized
    function waitForFirebase(callback, maxAttempts = 10) {
        let attempts = 0;
        const check = () => {
            attempts++;
            if (typeof FirebaseAuthService !== 'undefined' && firebaseAuth) {
                callback();
            } else if (attempts < maxAttempts) {
                setTimeout(check, 200);
            } else {
                console.warn('Firebase Auth not available, using fallback auth');
            }
        };
        check();
    }

    // Update the login modal to use Firebase Auth
    function enhanceLoginModal() {
        // Listen for auth state changes
        if (typeof FirebaseAuthService !== 'undefined') {
            FirebaseAuthService.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in
                    updateUIForSignedInUser(user);
                } else {
                    // User is signed out
                    updateUIForSignedOutUser();
                }
            });
        }
    }

    function updateUIForSignedInUser(user) {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.textContent = `Hi, ${user.displayName || user.email.split('@')[0]}`;
            loginBtn.onclick = showUserMenu;
        }

        // Store user info for other parts of the app
        const userInfo = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            token: 'firebase-' + user.uid
        };
        localStorage.setItem('studentgear_auth', JSON.stringify(userInfo));
        window.currentUser = userInfo;
    }

    function updateUIForSignedOutUser() {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            // Use Firebase modal if Firebase is available and properly initialized, otherwise keep script.js fallback
            if (typeof FirebaseAuthService !== 'undefined' &&
                typeof firebaseAuth !== 'undefined' && firebaseAuth &&
                typeof showFirebaseLoginModal === 'function') {
                loginBtn.onclick = showFirebaseLoginModal;
            }
            // If Firebase is not available, script.js already set up the fallback
        }
        localStorage.removeItem('studentgear_auth');
        window.currentUser = null;
    }

    function showUserMenu() {
        const user = FirebaseAuthService.getCurrentUser();
        if (!user) {
            showFirebaseLoginModal();
            return;
        }

        // Remove existing menu
        const existing = document.querySelector('.user-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.style.cssText = 'position:absolute;right:18px;top:64px;background:#fff;border:1px solid #e5e7eb;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,0.08);border-radius:8px;z-index:10000;';
        menu.innerHTML = `
            <ul style="list-style:none;margin:0;padding:0;">
                <li style="padding:8px 12px;border-bottom:1px solid #eee;">
                    <strong>${user.displayName || user.email.split('@')[0]}</strong>
                    <div style="font-size:12px;color:#666;">${user.email}</div>
                </li>
                <li style="padding:8px 12px;cursor:pointer;" id="profileBtn">👤 Profile</li>
                <li style="padding:8px 12px;cursor:pointer;" id="ordersBtn">📦 Orders</li>
                <li style="padding:8px 12px;cursor:pointer;color:#ef4444;" id="logoutBtn">🚪 Logout</li>
            </ul>
        `;
        document.body.appendChild(menu);

        // Close menu when clicking outside
        document.addEventListener('click', function onDocClick(e) {
            if (!menu.contains(e.target) && !document.querySelector('.login-btn').contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', onDocClick);
            }
        });

        // Handle logout
        menu.querySelector('#logoutBtn').addEventListener('click', async () => {
            await FirebaseAuthService.signOut();
            menu.remove();
            showNotification('👋 Logged out successfully');
        });

        // Handle profile (placeholder)
        menu.querySelector('#profileBtn').addEventListener('click', () => {
            menu.remove();
            showNotification('Profile page coming soon!');
        });

        // Handle orders (placeholder)
        menu.querySelector('#ordersBtn').addEventListener('click', () => {
            menu.remove();
            showNotification('Orders page coming soon!');
        });
    }

    function showFirebaseLoginModal() {
        // Remove existing modal
        const existing = document.querySelector('.login-modal-saas');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'login-modal-saas';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-card">
                <div class="modal-header">
                    <div class="modal-logo">🎓</div>
                    <h2 class="modal-title">Welcome to StudentGear</h2>
                    <p class="modal-subtitle">Your smart student marketplace</p>
                    <button class="modal-close" aria-label="Close">×</button>
                </div>
                <div class="modal-body">
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Sign In</button>
                        <button class="auth-tab" data-tab="signup">Create Account</button>
                    </div>
                    
                    <form id="firebaseLoginForm">
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input name="email" type="email" required class="form-input" placeholder="you@example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <div class="password-wrapper">
                                <input name="password" type="password" required class="form-input" placeholder="••••••••">
                                <button type="button" class="password-toggle">👁</button>
                            </div>
                        </div>
                        <div class="form-group" id="nameField" style="display:none;">
                            <label class="form-label">Full Name</label>
                            <input name="displayName" type="text" class="form-input" placeholder="John Doe">
                        </div>
                        <div id="authError" class="error-message" style="display:none;"></div>
                        <button type="submit" class="submit-btn btn-animated">
                            <span>Sign In</span>
                        </button>
                    </form>
                    
                    <div class="divider"><span>or continue with</span></div>
                    
                    <div class="social-login">
                        <button class="social-btn" title="Google">G</button>
                        <button class="social-btn" title="GitHub">⌘</button>
                    </div>
                    
                    <div style="text-align:center;margin-top:20px;">
                        <a href="#" id="forgotPassword" style="color:#667eea;font-size:0.9rem;text-decoration:none;">Forgot your password?</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('visible'), 10);

        // Get elements
        const form = modal.querySelector('#firebaseLoginForm');
        const tabs = modal.querySelectorAll('.auth-tab');
        const nameField = modal.querySelector('#nameField');
        const submitBtn = form.querySelector('.submit-btn');
        const errorDiv = modal.querySelector('#authError');
        const passwordToggle = modal.querySelector('.password-toggle');
        const passwordInput = form.querySelector('input[name="password"]');
        let isSignUp = false;

        // Insert a password strength meter element (progress bar + label)
        const pwdWrapper = form.querySelector('.password-wrapper');
        const pwdMeter = document.createElement('div');
        pwdMeter.className = 'password-meter';
        pwdMeter.style.cssText = 'margin-top:8px;display:flex;align-items:center;gap:8px;';
        pwdMeter.innerHTML = `<div class="meter-bar" style="flex:1;height:8px;background:#eee;border-radius:6px;overflow:hidden;"><div class="meter-fill" style="width:0%;height:100%;background:#ef4444"></div></div><div class="meter-label" style="min-width:80px;font-size:0.85rem;color:#444">Empty</div>`;
        pwdWrapper.appendChild(pwdMeter);
        const pwdStrength = pwdMeter.querySelector('.meter-label');
        const pwdFill = pwdMeter.querySelector('.meter-fill');

        function evaluatePasswordStrength(pw) {
            if (!pw) return { score: 0, label: 'Empty' };
            let score = 0;
            if (pw.length >= 8) score += 2;
            if (/[A-Z]/.test(pw)) score += 1;
            if (/[0-9]/.test(pw)) score += 1;
            if (/[^A-Za-z0-9]/.test(pw)) score += 1;
            let label = 'Weak';
            if (score >= 4) label = 'Very strong';
            else if (score >= 3) label = 'Strong';
            else if (score >= 2) label = 'Medium';
            return { score, label };
        }

        // Friendly error mapping
        function friendlyError(err) {
            // err may be an object { code, error } or a string
            const msg = (typeof err === 'string') ? err : (err && (err.code || err.error || err.message));
            const code = (typeof err === 'object' && err && (err.code || null)) || null;

            const map = {
                'auth/email-already-in-use': 'An account with this email already exists. Try signing in or use a different email.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/wrong-password': 'Incorrect password. Try again or reset your password.',
                'auth/user-not-found': 'No account found for that email. Try creating an account.',
                'auth/weak-password': 'Password is too weak. Use at least 8 characters with numbers and symbols.',
                'auth/too-many-requests': 'Too many attempts. Try again later.',
                'auth/network-request-failed': 'Network error. Check your connection and try again.'
            };

            if (code && map[code]) return map[code];
            // fallback to heuristics on message
            if (typeof msg === 'string') {
                if (msg.toLowerCase().includes('password')) return 'Password error: ' + msg;
                if (msg.toLowerCase().includes('email')) return 'Email error: ' + msg;
            }
            return typeof msg === 'string' ? msg : 'An unexpected error occurred. Please try again.';
        }

        // Password toggle
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            passwordToggle.textContent = type === 'password' ? '👁' : '🙈';
        });

        // Update strength on input
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value || '';
            const { score, label } = evaluatePasswordStrength(val);
            pwdStrength.textContent = `${label}`;
            const pct = Math.min(100, Math.round((score / 5) * 100));
            pwdFill.style.width = pct + '%';
            pwdFill.style.background = score >= 4 ? '#16a34a' : score >= 3 ? '#84cc16' : score >= 2 ? '#f59e0b' : '#ef4444';
        });

        // Tab switching with animation
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                isSignUp = tab.dataset.tab === 'signup';
                nameField.style.display = isSignUp ? 'block' : 'none';
                submitBtn.querySelector('span').textContent = isSignUp ? 'Create Account' : 'Sign In';
                errorDiv.style.display = 'none';
            });
        });

        // Close modal with animation
        const closeModal = () => {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        };
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Handle form submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.elements['email'].value.trim();
            const password = form.elements['password'].value;
            const displayName = form.elements['displayName'].value.trim();

            // Client-side validation
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // Clear inline error styles
            form.elements['email'].style.outline = '';
            form.elements['password'].style.outline = '';

            if (!emailRe.test(email)) {
                errorDiv.textContent = 'Please enter a valid email address';
                errorDiv.style.display = 'block';
                form.elements['email'].style.outline = '2px solid #ef4444';
                return;
            }
            if (isSignUp && password.length < 8) {
                errorDiv.textContent = 'Password must be at least 8 characters for new accounts';
                errorDiv.style.display = 'block';
                form.elements['password'].style.outline = '2px solid #ef4444';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.querySelector('span').textContent = isSignUp ? 'Creating account...' : 'Signing in...';
            errorDiv.style.display = 'none';

            try {
                let result;
                if (isSignUp) {
                    result = await FirebaseAuthService.signUp(email, password, displayName);
                } else {
                    result = await FirebaseAuthService.signIn(email, password);
                }

                if (result.success) {
                    closeModal();
                    showSaasNotification(isSignUp ? 'Account created!' : 'Welcome back!', 'success', isSignUp ? '🎉' : '✅');
                } else {
                    errorDiv.textContent = friendlyError(result);
                    errorDiv.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    submitBtn.querySelector('span').textContent = isSignUp ? 'Create Account' : 'Sign In';
                }
            } catch (error) {
                errorDiv.textContent = friendlyError(error);
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.querySelector('span').textContent = isSignUp ? 'Create Account' : 'Sign In';
            }
        });

        // Forgot password
        modal.querySelector('#forgotPassword').addEventListener('click', async (e) => {
            e.preventDefault();
            const email = form.elements['email'].value.trim();
            if (!email) {
                errorDiv.textContent = 'Please enter your email address first';
                errorDiv.style.display = 'block';
                return;
            }

            try {
                await firebaseAuth.sendPasswordResetEmail(email);
                showNotification('📧 Password reset email sent!');
            } catch (error) {
                errorDiv.textContent = friendlyError(error);
                errorDiv.style.display = 'block';
            }
        });

        // Focus first input
        form.elements['email'].focus();
    }

    // SaaS-style notification function
    function showSaasNotification(message, type = 'success', icon = '✓') {
        // Remove existing notification
        const existing = document.querySelector('.notification-saas');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification-saas ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice'}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
            <div class="progress-bar"></div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('visible'), 10);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        });

        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Helper function to show notifications (if not already defined)
    function showNotification(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
            return;
        }
        showSaasNotification(message, 'success', '✅');
    }

    // Initialize when ready
    waitForFirebase(() => {
        enhanceLoginModal();

        // Override the login button click handler
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            const user = FirebaseAuthService.getCurrentUser();
            if (user) {
                updateUIForSignedInUser(user);
            } else {
                loginBtn.onclick = showFirebaseLoginModal;
            }
        }
    });

    // Export for global access
    window.showFirebaseLoginModal = showFirebaseLoginModal;
    window.showSaasNotification = showSaasNotification;
})();
