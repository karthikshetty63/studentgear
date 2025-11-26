// app.loader.js — loads application scripts sequentially to reduce number of <script> tags in HTML
(function () {
    // Initialize Firebase first, then load other scripts
    if (typeof initializeFirebase === 'function') {
        initializeFirebase();
    }

    // Note: script.js already contains auth and search functionality,
    // so we don't load the separate search.js and auth.js modules.
    const scripts = [
        'script.js',
        'filters.js',
        'contact.js',
        'cart-manager.js',
        'firebase-auth-ui.js'
    ];

    function loadSequential(index) {
        if (index >= scripts.length) return;
        const s = document.createElement('script');
        s.src = scripts[index];
        s.async = false; // preserve execution order
        s.onload = () => loadSequential(index + 1);
        s.onerror = (e) => {
            console.error('Failed to load', scripts[index], e);
            loadSequential(index + 1);
        };
        document.body.appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadSequential(0));
    } else {
        loadSequential(0);
    }
})();
