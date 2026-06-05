import jwt from 'jsonwebtoken';
import { verifyToken as checkToken } from '../../utils/jwt.handle.js'; 

export const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        // Separamos el "Bearer " del string del token
        const token = authHeader.split(" ")[1];
        
        // funcion de utils
        const verified = checkToken(token);
        
        if (!verified) {
            return res.status(400).json({ message: "Token no válido" });
        }

        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Error al validar el token" });
    }
};

// Middleware para verificar si es Gerente
export const isGerente = (req, res, next) => {
    // Nota: Asegúrate de que el payload del JWT tenga el campo 'role'
    if (req.user.role !== 'Gerente') {
        return res.status(403).json({ message: "Acceso restringido: Se requiere rol de Gerente" });
    }
    next();
};
