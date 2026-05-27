const form = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

const successSound = new Audio('/public/success.mp3'); 

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const user = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // 1. VALIDACIÓN: Correo corporativo
    if (!email.toLowerCase().endsWith('@shuttlecloud.com')) {
        errorMessage.textContent = "Debes utilizar un correo corporativo de @shuttlecloud.com";
        errorMessage.style.display = 'block';
        return;
    }

    // 2. VALIDACIONES ESPECÍFICAS DE LA CONTRASEÑA
    
    // a) Longitud mínima
    if (password.length < 8) {
        errorMessage.textContent = "La contraseña es demasiado corta. Debe tener al menos 8 caracteres.";
        errorMessage.style.display = 'block';
        return;
    }

    // b) Al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
        errorMessage.textContent = "La contraseña debe incluir al menos una letra mayúscula.";
        errorMessage.style.display = 'block';
        return;
    }

    // c) Al menos una minúscula
    if (!/[a-z]/.test(password)) {
        errorMessage.textContent = "La contraseña debe incluir al menos una letra minúscula.";
        errorMessage.style.display = 'block';
        return;
    }

    // d) Al menos un número
    if (!/\d/.test(password)) {
        errorMessage.textContent = "La contraseña debe incluir al menos un número.";
        errorMessage.style.display = 'block';
        return;
    }

    // e) Al menos un carácter especial
    if (!/[\s$@$!%*?&._-]/.test(password)) {
        errorMessage.textContent = "La contraseña debe incluir al menos un carácter especial (ej: @, $, !, %, *, ?, &, ., _, -).";
        errorMessage.style.display = 'block';
        return;
    }

    // 3. VALIDACIÓN: Coincidencia de contraseñas
    if (password !== confirmPassword) {
        errorMessage.textContent = "Las contraseñas no coinciden";
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const res = await fetch("http://localhost:4000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, email, password, confirmPassword })
        });

        const resJson = await res.json();

        if (!res.ok) {
            errorMessage.textContent = resJson.message;
            errorMessage.style.display = 'block';
            return;
        }

        successSound.play().catch(err => console.log("El navegador bloqueó el audio: ", err));

        successMessage.textContent = "Cuenta creada con éxito";
        successMessage.style.display = 'block';
        successMessage.classList.remove('hide');
        successMessage.style.opacity = "1";

        setTimeout(() => {
            window.location.href = resJson.redirect || "/login";
        }, 2000);

    } catch (err) {
        errorMessage.textContent = "Error de conexión con el servidor";
        errorMessage.style.display = 'block';
    }
});