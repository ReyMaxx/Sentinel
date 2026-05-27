import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import {usuarios} from "../app/controllers/authentication.controller.js";

dotenv.config({ quiet: true });

function soloAdmin(req, res, next) {
    const logueado = revisarCookie(req, res);
    if (logueado) return next();
    return res.redirect("/login"); 
}

function soloPublico(req, res, next) {
    const logueado = revisarCookie(req, res);
    if (logueado) return res.redirect("/account"); 
    return next();
}

function revisarCookie(req, res) {
    try {
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) return false;

        const cookieJWT = cookieHeader.split("; ").find(cookie => cookie.startsWith("jwt="))?.slice(4);
        
        if (!cookieJWT) return false;

        const decoded = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);


        const usuarioARevisar = usuarios.find(usuario => usuario.user === decoded.user);
        
        if (!usuarioARevisar) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

export const methods = {
    soloAdmin,
    soloPublico,
    revisarCookie // <-- Añade esto
};