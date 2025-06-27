document.addEventListener('DOMContentLoaded', function () {
    // Modal elements
    const modal = document.getElementById('login-modal');
    const btn = document.getElementById('login-btn');
    const closeBtn = modal.querySelector('.close');
    const loginForm = document.getElementById('submit_login');
    const messageContainer = document.getElementById('message-container');

    // Login and Logout UI elements
    const loginContainer = document.querySelector('.login-container');

    // Modal functionality
    btn.addEventListener('click', function () {
        // Check if user is already logged in
        if (isUserLoggedIn()) {
            showLogoutUI();
        } else {
            showLoginUI();
        }
        modal.style.display = 'flex';
    });

    // Close modal events
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Check login status on page load
    checkLoginStatus();

    // Login form submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showMessage("Please enter both email and password.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                // Store user session in localStorage
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userEmail', email);

                showMessage("Login successful! Welcome!", "success");

                // Update UI to show logout option
                showLogoutUI();
            } else {
                const data = await response.json();
                showMessage(data.message || "Login failed.", "error");
            }
        } catch (error) {
            console.error("Error during login:", error);
            showMessage("An error occurred. Please try again later.", "error");
        }
    });

    // Logout functionality
    function addLogoutButton() {
        // Remove any existing logout button first
        const existingLogoutBtn = document.getElementById('logout-btn');
        if (existingLogoutBtn) {
            existingLogoutBtn.remove();
        }

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.id = 'logout-btn';
        logoutBtn.classList.add('logout-button');

        logoutBtn.addEventListener('click', function () {
            // Clear localStorage
            localStorage.removeItem('userToken');
            localStorage.removeItem('userEmail');

            // Show login UI again
            showLoginUI();

            // Optional: Send logout request to backend if needed
            fetch("http://localhost:3000/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('userToken')}`
                }
            }).catch(error => console.error("Logout error:", error));
        });

        loginContainer.appendChild(logoutBtn);
    }

    function showLogoutUI() {
        // Hide login form
        loginForm.style.display = 'none';

        // Hide registration link
        const registerLink = document.getElementById('register-link');
        if (registerLink) {
            registerLink.style.display = 'none';
        }

        // Add logout button
        addLogoutButton();

        // Show logged-in user email
        showMessage(`Logged in as: ${localStorage.getItem('userEmail')}`, "success");
    }

    function showLoginUI() {
        // Reset message container
        messageContainer.innerHTML = '';
        messageContainer.classList.remove('success', 'error');

        // Show login form
        loginForm.style.display = 'block';

        // Show registration link
        const registerLink = document.getElementById('register-link');
        if (registerLink) {
            registerLink.style.display = 'block';
        }

        // Remove logout button if exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }

    // Check if user is logged in
    function isUserLoggedIn() {
        return !!localStorage.getItem('userToken');
    }

    // Check login status and update UI
    function checkLoginStatus() {
        if (isUserLoggedIn()) {
            showLogoutUI();
        } else {
            showLoginUI();
        }
    }

    // Helper function to show messages
    function showMessage(message, type) {
        messageContainer.innerText = message;
        messageContainer.className = `message-container ${type}`;
    }
});