import { User } from '../models/user.model.js';
import { encrypt } from '../../utils/password.handle.js';
import { successResponse, errorResponse } from '../../utils/response.handle.js';
import { verifyEmailDomain } from '../../utils/email.validator.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        return successResponse(res, 'Usuarios recuperados', users);
    } catch (error) {
        return errorResponse(res, 'Error al obtener usuarios');
    }
};

export const createUser = async (req, res) => {
    try {
        const { password, email, ...userData } = req.body;
        
        // Verificar si el correo es real
        const isRealEmail = await verifyEmailDomain(email);
        if (!isRealEmail) {
            return errorResponse(res, 'El correo electrónico proporcionado no es un correo real o no puede recibir mensajes.', 400);
        }
        
        // Encriptación de la contraseña antes de ir a la DB
        const hashedPassword = await encrypt(password);
        
        const newUser = await User.create({
            ...userData,
            email,
            password: hashedPassword
        });

        return successResponse(res, 'Usuario registrado exitosamente', newUser, 200);
    } catch (error) {
        if (error.code === '23505') { // Error de duplicado en Postgres (email único)
            return errorResponse(res, 'El correo electrónico ya está registrado', 400);
        }
        return errorResponse(res, 'Error al crear el usuario');
    }
};