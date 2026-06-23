import { query } from '../config/db.js';

export const User = {
    // Buscar un usuario por email (fundamental para el login)
    findByEmail: async (email) => {
        const result = await query(
            'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = $1',
            [email]
        );
        return result.rows[0];
    },

    /**
     * Buscar por ID.
     * Útil para el perfil (me)
     */
    findById: async (id) => {
        const text = `
            SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id 
            WHERE u.user_id = $1
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    },

    create: async ({ first_name, last_name, email, password, role_id, status }) => {
        const result = await query(
            `INSERT INTO users (first_name, last_name, email, password, role_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, first_name, last_name`,
            [first_name, last_name, email, password, role_id, status]
        );
        return result.rows[0];
    },

    // Listar todos los usuarios para la gestión del Gerente
    getAll: async () => {
        const result = await query(
            `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, r.role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.role_id 
             ORDER BY u.user_id ASC`
        );
        return result.rows;
    },

    updatePassword: async (user_id, newHashedPassword) => {
        const text = `
            UPDATE users 
            SET password = $1 
            WHERE user_id = $2
        `;
        await query(text, [newHashedPassword, user_id]);
    },

    update: async (id, { first_name, last_name, email, role_id, status }) => {
        const text = `
            UPDATE users 
            SET first_name = $1, last_name = $2, email = $3, role_id = $4, status = $5
            WHERE user_id = $6 
            RETURNING user_id, first_name, last_name, email, role_id, status
        `;
        const result = await query(text, [first_name, last_name, email, role_id, status, id]);
        return result.rows[0];
    },

    delete: async (id) => {
        await query('DELETE FROM users WHERE user_id = $1', [id]);
        return true;
    }

};