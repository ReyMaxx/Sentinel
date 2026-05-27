const form = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    errorMessage.classList.remove('shake');

    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, password })
        });

        const resJson = await res.json();

        if (!res.ok) {
            errorMessage.textContent = resJson.message;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('shake');
            return;
        }

        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }

    } catch (error) {
        errorMessage.textContent = "Error de conexión con el servidor";
        errorMessage.style.display = 'block';
        console.error("Error:", error);
    }
});