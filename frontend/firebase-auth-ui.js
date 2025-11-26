// Firebase Auth UI Integration
// This file handles the UI integration for Firebase Authentication

(function() {
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
            loginBtn.onclick = showFirebaseLoginModal;
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
        const existing = document.querySelector('.firebase-login-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-container firebase-login-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content" style="max-width:420px;padding:24px;">
                <div class="modal-header">
                    <h3>🎓 Welcome to StudentGear</h3>
                    <button class="modal-close" aria-label="Close">×</button>
                </div>
                <div class="modal-body">
                    <div class="auth-tabs" style="display:flex;margin-bottom:16px;border-bottom:2px solid #eee;">
                        <button class="auth-tab active" data-tab="login" style="flex:1;padding:12px;border:none;background:none;cursor:pointer;font-weight:600;color:#6366f1;border-bottom:2px solid #6366f1;margin-bottom:-2px;">Login</button>
                        <button class="auth-tab" data-tab="signup" style="flex:1;padding:12px;border:none;background:none;cursor:pointer;font-weight:600;color:#666;">Sign Up</button>
                    </div>
                    
                    <form id="firebaseLoginForm" class="auth-form">
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:500;">Email</label>
                            <input name="email" type="email" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" placeholder="your@email.com">
                        </div>
                        <div style="margin-bottom:12px;position:relative;">
                            <label style="display:block;margin-bottom:4px;font-weight:500;">Password</label>
                            <input name="password" type="password" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" placeholder="••••••••">
                        </div>
                        <div id="nameField" style="margin-bottom:12px;display:none;">
                            <label style="display:block;margin-bottom:4px;font-weight:500;">Full Name</label>
                            <input name="displayName" type="text" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" placeholder="John Doe">
                        </div>
                        <div id="authError" style="color:#ef4444;font-size:14px;margin-bottom:12px;display:none;"></div>
                        <button type="submit" class="btn-primary" style="width:100%;padding:12px;background:#6366f1;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">
                            Login
                        </button>
                    </form>
                    
                    <div style="text-align:center;margin-top:16px;color:#666;font-size:14px;">
                        <a href="#" id="forgotPassword" style="color:#6366f1;">Forgot password?</a>
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
        const submitBtn = form.querySelector('button[type="submit"]');
        const errorDiv = modal.querySelector('#authError');
        let isSignUp = false;

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.color = '#666';
                    t.style.borderBottom = 'none';
                });
                tab.classList.add('active');
                tab.style.color = '#6366f1';
                tab.style.borderBottom = '2px solid #6366f1';
                
                isSignUp = tab.dataset.tab === 'signup';
                nameField.style.display = isSignUp ? 'block' : 'none';
                submitBtn.textContent = isSignUp ? 'Create Account' : 'Login';
                errorDiv.style.display = 'none';
            });
        });

        // Close modal
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

        // Handle form submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.elements['email'].value.trim();
            const password = form.elements['password'].value;
            const displayName = form.elements['displayName'].value.trim();

            submitBtn.disabled = true;
            submitBtn.textContent = isSignUp ? 'Creating account...' : 'Signing in...';
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
                    showNotification(isSignUp ? '🎉 Account created successfully!' : '✅ Welcome back!');
                } else {
                    errorDiv.textContent = result.error;
                    errorDiv.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = isSignUp ? 'Create Account' : 'Login';
                }
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = isSignUp ? 'Create Account' : 'Login';
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
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });

        // Focus first input
        form.elements['email'].focus();
    }

    // Helper function to show notifications (if not already defined)
    function showNotification(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
            return;
        }

        const notification = document.createElement('div');
        notification.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1f2937;color:white;padding:12px 20px;border-radius:8px;z-index:10003;animation:slideIn 0.3s ease;';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
})();
