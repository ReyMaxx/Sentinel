import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const usuarios = [{
    user: "admin",
    email: "admin@shuttlecloud.com",
    password: "$2b$10$2H47zOboq7SODo.6mEQy9OVktyfrnV3sZjPOsFHkiUEadkVMrU7p6",
    fechaCreacion: "2026-04-24T14:22:10Z" // <-- CORREGIDO: Formato ISO estándar
}];

async function login(req, res) {
    const { user, password } = req.body;

    const usuarioARevisar = usuarios.find(usuario => usuario.user === user);

    if (!usuarioARevisar) {
        return res.status(400).json({
            status: "Error",
            message: "Usuario o contraseña incorrectos"
        });
    }

    const loginCorrecto = await bcryptjs.compare(password, usuarioARevisar.password);

    if (!loginCorrecto) {
        return res.status(401).json({
            status: "Error",
            message: "Usuario o contraseña incorrectos"
        });
    }

    const token = jsonwebtoken.sign(
        { user: usuarioARevisar.user }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    const cookieOption = {
        maxAge: process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: "/",
    }
    res.cookie("jwt", token, cookieOption);
    return res.status(200).json({
        status: "OK",
        message: "Login exitoso",
        redirect: "/account",
        token
    });
}

async function register(req, res) {
    const { user, email, password, confirmPassword } = req.body;

    // 1. VALIDACIÓN: Email corporativo
    if (!email || !email.toLowerCase().endsWith('@shuttlecloud.com')) {
        return res.status(400).json({
            status: "Error",
            message: "Debes utilizar un correo corporativo de @shuttlecloud.com"
        });
    }

    // 2. VALIDACIONES SECUENCIALES DE LA CONTRASEÑA
    if (!password || password.length < 8) {
        return res.status(400).json({
            status: "Error",
            message: "La contraseña es demasiado corta. Debe tener al menos 8 caracteres."
        });
    }

    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            status: "Error",
            message: "La contraseña debe incluir al menos una letra mayúscula."
        });
    }

    if (!/[a-z]/.test(password)) {
        return res.status(400).json({
            status: "Error",
            message: "La contraseña debe incluir al menos una letra minúscula."
        });
    }

    if (!/\d/.test(password)) {
        return res.status(400).json({
            status: "Error",
            message: "La contraseña debe incluir al menos un número."
        });
    }

    if (!/[\s$@$!%*?&._-]/.test(password)) {
        return res.status(400).json({
            status: "Error",
            message: "La contraseña debe incluir al menos un carácter especial (ej: @, $, !, %, *, ?, &, ., _, -)."
        });
    }

    // 3. VALIDACIÓN: Coincidencia de contraseñas
    if (password !== confirmPassword) {
        return res.status(400).json({
            status: "Error",
            message: "Las contraseñas no coinciden"
        });
    }

    // 4. VALIDACIÓN: Usuario o Email duplicado
    const usuarioARevisar = usuarios.find(
        u => u.user === user || u.email === email
    );

    if (usuarioARevisar) {
        return res.status(400).json({
            status: "Error",
            message: "El usuario o email ya está registrado"
        });
    }

    try {
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

const nuevoUsuario = {
    user,
    email,
    password: hashPassword,
    fechaCreacion: new Date() // <-- CORREGIDO: Guarda el objeto Date nativo (o usa new Date().toISOString())
};

    usuarios.push(nuevoUsuario);

    return res.status(200).json({
        status: "OK",
        message: "Usuario registrado correctamente",
        redirect: "/login"
    });

    } catch (error) {
        return res.status(500).json({
            status: "Error",
            message: "Error interno del servidor"
        });
    }
}

export const methods = {
    login,
    register
};