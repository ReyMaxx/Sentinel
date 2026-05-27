// IMPORTACIÓN
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv"; // <-- CORRECCIÓN: Importamos dotenv

// Inicializamos las variables de entorno inmediatamente
dotenv.config({ quiet: true }); // <-- CORRECCIÓN: Activamos la lectura del .env

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { methods as authentication, usuarios } from "./controllers/authentication.controller.js";
import { methods as authorization } from "../middlewares/authorization.js";

const app = express();
app.set("port", 4000);

// CONFIGURACIÓN
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser());

// RUTAS
app.get("/", (req, res) => res.sendFile(__dirname + "/pages/index.html"));
app.get("/login", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/login.html"));
app.get("/register", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/register.html"));
app.get("/account", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin/account.html"));
app.get("/cursos", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/cursos.html"));
app.post("/api/register", authentication.register);
app.post("/api/login", authentication.login);

// CERRAR SESIÓN
app.post("/api/logout", (req, res) => {
    res.setHeader('Set-Cookie', 'jwt=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax');
    return res.json({ status: "ok", message: "Sesión cerrada" });
});

// NUEVA RUTA: Endpoint para verificar sesión y enviar la información completa del usuario
app.get("/api/session", (req, res) => {
    const logueado = authorization.revisarCookie(req, res);
    
    if (logueado) {
        try {
            const cookieHeader = req.headers.cookie;
            if (!cookieHeader) return res.json({ logueado: false });

            // Buscamos la cookie de manera más robusta barriendo los espacios intermedios
            const cookiesSeparadas = cookieHeader.split(';');
            const cookieObjetivo = cookiesSeparadas.find(c => c.trim().startsWith('jwt='));
            const cookieJWT = cookieObjetivo ? cookieObjetivo.split('=')[1] : null;
            
            if (!cookieJWT) return res.json({ logueado: false });
            
            // Decodificamos usando la clave del proceso (ahora sí disponible gracias a dotenv)
            const decoded = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
            
            // Buscamos al usuario en nuestra "base de datos" en memoria
            const datosUsuario = usuarios.find(u => u.user === decoded.user);
            
if (datosUsuario) {
    // Inicializamos una variable para la fecha formateada
    let fechaCreacionFormateada = "Cuenta de sistema (Pre-existente)";

    // Si existe la fecha en la base de datos (y ahora que es un string ISO válido), funcionará perfectamente:
    if (datosUsuario.fechaCreacion) {
        fechaCreacionFormateada = new Date(datosUsuario.fechaCreacion).toLocaleString("es-ES", { 
            timeZone: "Europe/Madrid", 
            hour12: false 
        });
    }

    return res.json({ 
        logueado: true,
        user: datosUsuario.user,
        email: datosUsuario.email,
        fechaCreacion: fechaCreacionFormateada,
        
        // Forzamos la hora local de Madrid en formato de 24 horas para el login actual
        ultimoLogin: new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid", hour12: false })
    });
} else {
    return res.json({ logueado: false, message: "Usuario no encontrado" });
}

        } catch (error) {
            console.error("Error al verificar token en /api/session:", error.message);
            return res.json({ logueado: false });
        }
    }
    
    return res.json({ logueado: false });
});

app.listen(app.get("port"), () => {
    console.log("Servidor iniciado en el puerto", app.get("port"));
});