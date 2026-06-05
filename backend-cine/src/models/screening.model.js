import db from '../config/db.js';

const Screening = {
    // Listar funciones con detalles de película y sala 
    findAll: async () => {
        const query = `
            SELECT 
                s.screening_id,
                s.movie_id,
                s.room_id,
                s.date_time, 
                m.title as movie_title, 
                r.room_number, 
                r.room_type
            FROM screenings s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN rooms r ON s.room_id = r.room_id
            ORDER BY s.date_time ASC`;
        const { rows } = await db.query(query);
        return rows;
    },

    // Buscar una función específica con sus relaciones
    findById: async (id) => {
        const query = `
            SELECT s.*, m.title, r.room_number 
            FROM screenings s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN rooms r ON s.room_id = r.room_id
            WHERE s.screening_id = $1`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    // Programar una nueva función
    create: async (data) => {
        const { date_time, movie_id, room_id } = data;
        const query = `
            INSERT INTO screenings (date_time, movie_id, room_id)
            VALUES ($1, $2, $3) RETURNING *`;
        const { rows } = await db.query(query, [date_time, movie_id, room_id]);
        return rows[0];
    },

    // Re-programar o cambiar película/sala de una función
    update: async (id, data) => {
        const { date_time, movie_id, room_id } = data;
        const query = `
            UPDATE screenings 
            SET date_time = $1, movie_id = $2, room_id = $3
            WHERE screening_id = $4 RETURNING *`;
        const { rows } = await db.query(query, [date_time, movie_id, room_id, id]);
        return rows[0];
    },

    // Eliminar función 
    delete: async (id) => {
        await db.query('DELETE FROM screenings WHERE screening_id = $1', [id]);
        return true;
    }
};

export default Screening;