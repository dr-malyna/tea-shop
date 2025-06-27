document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const firstName = document.getElementById("first_name").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeat_password").value;
    const termsAccepted = document.getElementById("terms").checked;
    const message = document.getElementById("message");

    // Reset previous messages
    message.textContent = "";
    message.style.color = "red";

    // Email Validation (must contain @ and domain with .)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        message.textContent = "Invalid email format!";
        return;
    }

    // First Name Validation (no digits allowed)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(firstName)) {
        message.textContent = "First name cannot contain numbers!";
        return;
    }

    // Password Validation (at least 8 characters, 1 special symbol)
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        message.textContent = "Password must be at least 8 characters with 1 special symbol!";
        return;
    }

    // Check if passwords match
    if (password !== repeatPassword) {
        message.textContent = "Passwords do not match!";
        return;
    }

    // Check terms acceptance
    if (!termsAccepted) {
        message.textContent = "You must accept the terms and conditions.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email, 
                first_name: firstName, 
                password 
            }),
        });

        const data = await response.json();

        // Handle server response message
        if (response.ok) {
            // Registration was successful, show success message
            message.style.color = "green";
            message.textContent = data.message || "Registration successful!";
        } else {
            // Registration failed (e.g., email already exists)
            message.style.color = "red";
            message.textContent = data.message || "Registration failed.";
        }
    } catch (error) {
        // Error handling in case of network issues
        message.style.color = "red";
        message.textContent = "Error connecting to server.";
        console.error("Registration error:", error);
    }
});
