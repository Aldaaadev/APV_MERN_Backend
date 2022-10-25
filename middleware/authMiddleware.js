import  jwt  from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {

    let token;
    // Comrpobando que el token sea válido
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Separando "Bearer" de un " " y tomando el token
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Trayendo información del usuario menos la sensible
            req.veterinario = await Veterinario.findById(decoded.id).select("-password -token -confirmado"); 
            return next( );
        } catch (error) {
            const e = new Error("Token no válido");
            res.status(403).json({msg: e.message});
        }
    };

    // Comprobando que no haya o no exista un token
    if(!token) {
        const error = new Error("Token no válido o inexistente");
        return res.status(403).json({msg: error.message});
    }
    next( );
}

export default checkAuth;