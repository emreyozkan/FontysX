document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorDiv = document.getElementById('error-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';

            const data = {
                fullname: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                // Check if the server actually sent JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        window.location.href = result.redirectUrl;
                    } else {
                        errorDiv.style.display = 'block';
                        errorDiv.innerText = result.message || "Registration failed.";
                    }
                } else {
                    // This runs if the server sent plain text instead of JSON
                    const text = await response.text();
                    errorDiv.style.display = 'block';
                    errorDiv.innerText = text; 
                }

            } catch (error) {
                console.error("Fetch error:", error);
                errorDiv.style.display = 'block';
                errorDiv.innerText = "Connection error. Please check if your server is running.";
            }
        });
    }
});