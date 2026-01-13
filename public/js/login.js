document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorDiv = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            // 1. Stop the page from refreshing
            e.preventDefault();

            // 2. Collect the data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 3. Reset the error message display
            errorDiv.style.display = 'none';

            try {
                // 4. Send request to your Express server
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                // 5. Parse the JSON response
                const result = await response.json();

                if (response.ok && result.success) {
                    // SUCCESS: Move to the URL provided by the server (teacher or game)
                    window.location.href = result.redirectUrl; 
                } else {
                    // SERVER-SIDE ERROR: Show the red message (e.g., "Invalid email or password")
                    errorDiv.style.display = 'block';
                    errorDiv.innerText = result.message || "Incorrect email or password.";
                }
            } catch (error) {
                // CLIENT-SIDE/NETWORK ERROR: Server is down or wrong URL
                console.error("Login Error:", error);
                errorDiv.style.display = 'block';
                errorDiv.innerText = "Connection error. Please ensure the server is running.";
            }
        });
    }
});