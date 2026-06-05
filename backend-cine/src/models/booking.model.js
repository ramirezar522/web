import db from '../config/db.js';

const Booking = {
    // Obtener todas las reservas con detalles 
    findAll: async () => {
        const query = `
            SELECT 
                b.booking_id, b.created_at, b.booking_status,
                c.first_name || ' ' || c.last_name as customer_name,
                m.title as movie_title,
                s.date_time as screening_time,
                u.first_name as staff_name
            FROM bookings b
            JOIN customers c ON b.customer_id = c.customer_id
            JOIN screenings s ON b.screening_id = s.screening_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC`;
        const { rows } = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM bookings WHERE booking_id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    create: async (data) => {
        const { customer_id, screening_id, user_id, booking_status } = data;
        const query = `
            INSERT INTO bookings (customer_id, screening_id, user_id, booking_status, created_at)
            VALUES ($1, $2, $3, $4, NOW()) 
            RETURNING *`;
        const values = [customer_id, screening_id, user_id, booking_status || 'Confirmada'];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    updateStatus: async (id, status) => {
        const query = 'UPDATE bookings SET booking_status = $1 WHERE booking_id = $2 RETURNING *';
        const { rows } = await db.query(query, [status, id]);
        return rows[0];
    }
};

export default Booking;