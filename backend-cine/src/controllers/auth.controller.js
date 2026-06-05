import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { encrypt, verified } from '../../utils/password.handle.js';
import { generateToken } from '../../utils/jwt.handle.js';
import { successResponse, errorResponse } from '../../utils/response.handle.js';
import { sendRecoveryEmail } from '../../utils/mailer.hadle.js';

/**
 * Lógica de Registro de Usuarios
 */
export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role_id } = req.body;

        // 1. Verificar si el usuario ya existe para evitar duplicados
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return errorResponse(res, 'El correo electrónico ya está registrado', 400);
        }

        // 2. Encriptar la contraseña 
        const hashedPassword = await encrypt(password);

        // 3. Crear el usuario en la base de datos
        // Por defecto, los usuarios nuevos suelen crearse como 'Activo'
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role_id,
            status: 'Activo'
        });

        // 4. (Opcional) Generar token para que el usuario entre directamente
        const token = generateToken({
            user_id: newUser.user_id,
            role_name: 'Empleado' // O el nombre del rol según el role_id
        });

        return successResponse(res, 'Registro exitoso', {
            user: {
                id: newUser.user_id,
                name: `${newUser.first_name} ${newUser.last_name}`,
                email: newUser.email
            },
            token
        }, 201); // 201: Created

    } catch (error) {
        console.error('Error en el registro:', error);
        return errorResponse(res, 'Error interno al intentar registrar el usuario');
    }
};

/**
 * Lógica de inicio de sesión (Login)
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificar si el usuario existe
        const user = await User.findByEmail(email);
        
        if (!user) {
            return errorResponse(res, 'Credenciales inválidas (Usuario no encontrado)', 401);
        }

        // 2. Verificar si la cuenta está activa
        if (user.status !== 'Activo') {
            return errorResponse(res, 'La cuenta se encuentra desactivada o bloqueada', 403);
        }

        // 3. Comparar la contraseña ingresada con el hash 
        const isPasswordCorrect = await verified(password, user.password);
        console.log('resultado de la verificación de contraseña:', isPasswordCorrect);
        
        if (!isPasswordCorrect) {
            return errorResponse(res, 'Credenciales inválidas (Contraseña incorrecta)', 401);
        }

        // 4. Generar el Token JWT con los datos del usuario y su rol
        const token = generateToken(user);

        // 5. Enviar respuesta exitosa con el token y datos básicos
        return successResponse(res, 'Bienvenido al Sistema de Cine', {
            user: {
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role_name
            },
            token
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return errorResponse(res, 'Error interno del servidor durante la autenticación');
    }
};

/**
 * Función opcional para obtener el perfil del usuario actual (Me)
 */
    export const getProfile = async (req, res) => {
    try {
        // req.user viene inyectado por el authMiddleware
        const user = await User.findByEmail(req.user.email);
        return successResponse(res, 'Perfil recuperado', {
            id: user.user_id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role_name
        });
    } catch (error) {
        return errorResponse(res, 'Error al recuperar perfil');
    }
    };

    export const recoverPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validar si el correo existe en el sistema
        const user = await User.findByEmail(email);
        
        if (!user) {
            return errorResponse(res, 'No existe ninguna cuenta asociada a este correo electrónico', 404);
        }

        // 2. Crear una nueva contraseña aleatoria (8 caracteres alfanuméricos)
        const newPassword = crypto.randomBytes(4).toString('hex');

        // 3. Encriptar la nueva contraseña
        const hashedPassword = await encrypt(newPassword);

        // 4. Actualizar la base de datos
        await User.updatePassword(user.user_id, hashedPassword);

        // 5. Enviar el correo al usuario
        await sendRecoveryEmail(user.email, newPassword);

        // 6. Responder al cliente
        return successResponse(res, 'Contraseña restablecida. Por favor, revisa tu bandeja de entrada.');

    } catch (error) {
        console.error('Error en recoverPassword:', error);
        return errorResponse(res, 'Hubo un error al intentar recuperar la contraseña. Intenta más tarde.');
    }
};