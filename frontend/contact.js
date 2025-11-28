// Contact form functionality with readiness guard
function initContact() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContact);
} else {
    initContact();
}

// Handle contact form submission
async function handleContactSubmission(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Use authenticated backend webhook to persist the contact message
        // Require user to be signed in (Firebase ID token)
        let idToken = null;
        if (window.FirebaseAuthService && typeof FirebaseAuthService.getIdToken === 'function') {
            idToken = await FirebaseAuthService.getIdToken();
        }

        if (!idToken) {
            // Prompt user to sign in
            if (typeof showSaasNotification === 'function') showSaasNotification('Please sign in to send a message', 'error', '🔒');
            if (typeof window.showFirebaseLoginModal === 'function') window.showFirebaseLoginModal();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Try relative endpoint first, then common localhost fallback ports
        const candidates = ['/api/contact', 'http://localhost:3002/api/contact', 'http://localhost:3000/api/contact'];
        let resp = null;
        let body = null;
        let success = false;
        for (const url of candidates) {
            try {
                resp = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify(data)
                });
                body = await resp.json().catch(() => ({}));
                if (resp.ok) { success = true; break; }
            } catch (e) {
                // try next candidate
                resp = null;
                body = null;
            }
        }

        if (!success) {
            console.error('Contact backend error: no successful response', body);
            if (typeof showSaasNotification === 'function') showSaasNotification('Failed to send message. Try again later.', 'error', '❌');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        showSaasNotification('Message sent! We will contact you soon.', 'success', '📬');

        // Show success message

        // Reset form
        event.target.reset();

        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('❌ Failed to send message. Please try again.');

        // Restore button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show notification function (if not already defined)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}