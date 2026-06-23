import { User } from '../models/user.model.js';
import { encrypt } from '../../utils/password.handle.js';
import { successResponse, errorResponse } from '../../utils/response.handle.js';
import { verifyEmailDomain } from '../../utils/email.validator.js';
import { query } from '../config/db.js';

export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const roleId = req.query.role_id ? parseInt(req.query.role_id, 10) : null;
        const status = req.query.status;
        const search = req.query.search;
        
        let queryStr = `
            SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role_id, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE 1=1`;
        
        let countQueryStr = `
            SELECT COUNT(*) 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE 1=1`;
            
        const queryParams = [];
        let paramCount = 0;
        
        if (roleId) {
            paramCount++;
            queryStr += ` AND u.role_id = $${paramCount}`;
            countQueryStr += ` AND u.role_id = $${paramCount}`;
            queryParams.push(roleId);
        }
        
        if (status && status !== 'todos') {
            paramCount++;
            queryStr += ` AND u.status = $${paramCount}`;
            countQueryStr += ` AND u.status = $${paramCount}`;
            queryParams.push(status);
        }
        
        if (search) {
            paramCount++;
            queryStr += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            countQueryStr += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY u.user_id ASC`;
        
        const countRes = await query(countQueryStr, queryParams);
        const total = parseInt(countRes.rows[0].count, 10);
        
        if (page && limit) {
            const offset = (page - 1) * limit;
            paramCount++;
            queryStr += ` LIMIT $${paramCount}`;
            queryParams.push(limit);
            
            paramCount++;
            queryStr += ` OFFSET $${paramCount}`;
            queryParams.push(offset);
        }
        
        const { rows } = await query(queryStr, queryParams);
        
        if (page && limit) {
            return successResponse(res, 'Usuarios recuperados', rows, 200, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            });
        }
        
        return successResponse(res, 'Usuarios recuperados', rows);
    } catch (error) {
        return errorResponse(res, 'Error al obtener usuarios: ' + error.message);
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

export const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { password, email } = req.body;
        
        if (email) {
            const isRealEmail = await verifyEmailDomain(email);
            if (!isRealEmail) {
                return errorResponse(res, 'El correo electrónico proporcionado no es un correo real.', 400);
            }
        }

        const dataToUpdate = { ...req.body };
        if (password) {
            const hashedPassword = await encrypt(password);
            await User.updatePassword(id, hashedPassword);
        }

        const updatedUser = await User.update(id, dataToUpdate);
        if (!updatedUser) {
            return errorResponse(res, 'Usuario no encontrado', 404);
        }

        return successResponse(res, 'Usuario actualizado exitosamente', updatedUser);
    } catch (error) {
        if (error.code === '23505') {
            return errorResponse(res, 'El correo electrónico ya está registrado', 400);
        }
        return errorResponse(res, 'Error al actualizar el usuario: ' + error.message);
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.delete(id);
        return successResponse(res, 'Usuario eliminado exitosamente');
    } catch (error) {
        return errorResponse(res, 'Error al eliminar el usuario: ' + error.message);
    }
};