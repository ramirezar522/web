import jwt from 'jsonwebtoken';

/**
 * Genera un JWT para el usuario autenticado.
 * Incluye el ID y el Rol (Gerente/Empleado)
 */
export const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.user_id, 
            role: user.role_name 
        }, 
        process.env.JWT_SECRET, 
        { 
            expiresIn: '8h' 
        }
    );
};

/**
 * Verifica si un token es válido y no ha expirado.
 */
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};