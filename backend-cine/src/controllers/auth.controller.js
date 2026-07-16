import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { encrypt, verified } from '../../utils/password.handle.js';
import { generateToken } from '../../utils/jwt.handle.js';
import { successResponse, errorResponse } from '../../utils/response.handle.js';
import { sendRecoveryEmail } from '../../utils/mailer.hadle.js';
import { verifyEmailDomain } from '../../utils/email.validator.js';
import { resetLimiterKeys } from '../middlewares/rateLimiter.js';

/**
 * Lógica de Registro de Usuarios
 */
export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role_id } = req.body;

        // 1. Verificar si el correo es real (tiene dominio con registros MX)
        const isRealEmail = await verifyEmailDomain(email);
        if (!isRealEmail) {
            return errorResponse(res, 'El correo electrónico proporcionado no es un correo real o no puede recibir mensajes.', 400);
        }

        // 2. Verificar si el usuario ya existe para evitar duplicados
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
            role_name: 'Empleado', // O el nombre del rol según el role_id
            email: newUser.email
        });

        // Reset rate limiter counts on successful registration
        resetLimiterKeys(req.ip);

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
        return errorResponse(res, 'Error interno: ' + error.message);
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

        // Reset rate limiter counts on successful login
        resetLimiterKeys(req.ip);

        // 5. Enviar respuesta exitosa con el token y datos básicos
        return successResponse(res, 'Bienvenido al Sistema de Cine', {
            user: {
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
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
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_name: user.role_name,
            status: user.status,
            profile_photo: user.profile_photo || null,
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

/**
 * Actualizar perfil del usuario autenticado
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id || req.user.id;
        const { first_name, last_name, email, current_password, new_password, profile_photo } = req.body;

        // Get current user data
        const currentUser = await User.findByEmail(req.user.email);
        if (!currentUser) {
            return errorResponse(res, 'Usuario no encontrado', 404);
        }

        // If changing password, verify current password
        if (new_password) {
            if (!current_password) {
                return errorResponse(res, 'Debe proporcionar la contraseña actual para cambiarla', 400);
            }
            const isPasswordCorrect = await verified(current_password, currentUser.password);
            if (!isPasswordCorrect) {
                return errorResponse(res, 'La contraseña actual es incorrecta', 401);
            }
            const hashedNewPassword = await encrypt(new_password);
            await User.updatePassword(currentUser.user_id, hashedNewPassword);
        }

        // Update profile fields
        const updatedUser = await User.updateProfile(currentUser.user_id, {
            first_name: first_name || currentUser.first_name,
            last_name: last_name || currentUser.last_name,
            email: email || currentUser.email,
            profile_photo: profile_photo !== undefined ? profile_photo : (currentUser.profile_photo || null),
        });

        return successResponse(res, 'Perfil actualizado exitosamente', {
            user_id: updatedUser.user_id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email: updatedUser.email,
            role_name: currentUser.role_name,
            profile_photo: updatedUser.profile_photo || null,
        });
    } catch (error) {
        console.error('Error en updateProfile:', error);
        return errorResponse(res, 'Error al actualizar el perfil: ' + error.message);
    }
};

/**
 * Lógica para Login/Registro con Google
 */
export const googleLogin = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return errorResponse(res, 'El correo electrónico es requerido', 400);
        }

        // 1. Buscar si el usuario ya existe
        let user = await User.findByEmail(email);

        if (!user) {
            // 2. Si no existe, lo creamos
            const names = name ? name.split(' ') : ['Usuario', 'Google'];
            const first_name = names[0] || 'Usuario';
            const last_name = names.slice(1).join(' ') || 'Google';
            
            // Generar una contraseña aleatoria encriptada
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await encrypt(randomPassword);

            await User.create({
                first_name,
                last_name,
                email,
                password: hashedPassword,
                role_id: 2, // Empleado / Cliente por defecto
                status: 'Activo'
            });

            // Volvemos a consultar para traer el rol y toda la estructura correcta
            user = await User.findByEmail(email);
        }

        // 3. Verificar si el usuario está activo
        if (user.status !== 'Activo') {
            return errorResponse(res, 'La cuenta se encuentra desactivada o bloqueada', 403);
        }

        // 4. Generar el Token JWT
        const token = generateToken(user);

        // Reset rate limiter counts on successful Google login
        resetLimiterKeys(req.ip);

        // 5. Devolver datos en el formato correcto
        return successResponse(res, 'Sesión iniciada con Google', {
            user: {
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role_name
            },
            token
        });
    } catch (error) {
        console.error('Error en googleLogin:', error);
        return errorResponse(res, 'Error al iniciar sesión con Google: ' + error.message);
    }
};