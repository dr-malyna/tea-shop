// Open login modal when "Log in" link is clicked
document.getElementById('login-link').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('login-modal').style.display = 'block';
});

// Open login modal when login icon is clicked
document.getElementById('login-btn').addEventListener('click', function () {
    document.getElementById('login-modal').style.display = 'block';
});

// Create error message elements if they don't exist
if (!document.getElementById('email-error')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'email-error';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.style.display = 'none';
    errorDiv.textContent = 'Please enter a valid email address.';

    const emailInput = document.getElementById('login-email');
    emailInput.parentNode.insertBefore(errorDiv, emailInput.nextSibling);
}

if (!document.getElementById('password-error')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'password-error';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.style.display = 'none';
    errorDiv.textContent = 'Please enter your password.';

    const passwordInput = document.getElementById('login-password');
    passwordInput.parentNode.insertBefore(errorDiv, passwordInput.nextSibling);
}

if (!document.getElementById('login-message')) {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'login-message';
    messageDiv.style.fontSize = '14px';
    messageDiv.style.marginTop = '10px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.display = 'none';

    const loginButton = document.getElementById('login-submit');
    loginButton.parentNode.insertBefore(messageDiv, loginButton.nextSibling);
}

// Handle login submission
document.getElementById('login-submit').addEventListener('click', async function () {
    // Clear previous messages
    const messageDiv = document.getElementById('login-message');
    messageDiv.textContent = '';
    messageDiv.style.display = 'none';
    messageDiv.style.color = '';

    // Reset error displays
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('email-error').style.display = 'block';
        return;
    }

    // Validate password
    if (!password) {
        document.getElementById('password-error').style.display = 'block';
        return;
    }

    try {
        // Show loading message
        messageDiv.textContent = 'Logging in...';
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#333';

        // Make an API call to validate the email and password
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Successful login
            messageDiv.textContent = 'Login successful!';
            messageDiv.style.color = 'green';

            // Fill the email field in the checkout form
            document.getElementById('email').value = email;

            // Close the modal after a short delay
            setTimeout(() => {
                document.getElementById('login-modal').style.display = 'none';
                messageDiv.style.display = 'none';
            }, 1500);
        } else {
            // Login failed
            messageDiv.textContent = data.message || 'Invalid email or password.';
            messageDiv.style.color = 'red';
        }
    } catch (err) {
        console.error('Error during login:', err);
        messageDiv.textContent = 'Connection error. Please try again later.';
        messageDiv.style.color = 'red';
    }
});

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('login-modal');
    if (event.target === modal) {
        modal.style.display = 'none';

        // Clear error messages when closing
        document.getElementById('email-error').style.display = 'none';
        document.getElementById('password-error').style.display = 'none';

        const messageDiv = document.getElementById('login-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
});