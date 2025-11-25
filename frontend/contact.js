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

        // TODO: Replace with actual API call
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        showNotification('✅ Message sent successfully! We\'ll get back to you soon.');

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