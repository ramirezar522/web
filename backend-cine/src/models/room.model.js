import db from '../config/db.js';

const Room = {
    // Obtener todas las salas ordenadas por número
    findAll: async () => {
        const { rows } = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
        return rows;
    },

    // Buscar una sala específica por su ID
    findById: async (id) => {
        const { rows } = await db.query('SELECT * FROM rooms WHERE room_id = $1', [id]);
        return rows[0];
    },

    // Registrar una nueva sala (2D, 3D, VIP)
    create: async (data) => {
        const { room_number, total_capacity, room_type, room_status } = data;
        const query = `
            INSERT INTO rooms (room_number, total_capacity, room_type, room_status)
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [room_number, total_capacity, room_type, room_status || 'Disponible'];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Actualizar datos de la sala o cambiar su estado (ej: a 'Mantenimiento')
    update: async (id, data) => {
        const { room_number, total_capacity, room_type, room_status } = data;
        const query = `
            UPDATE rooms 
            SET room_number = $1, total_capacity = $2, room_type = $3, room_status = $4
            WHERE room_id = $5 RETURNING *`;
        const { rows } = await db.query(query, [room_number, total_capacity, room_type, room_status, id]);
        return rows[0];
    },

    // Eliminar sala (la integridad referencial impedirá borrar si hay funciones activas)
    delete: async (id) => {
        await db.query('DELETE FROM rooms WHERE room_id = $1', [id]);
        return true;
    }
};

export default Room;