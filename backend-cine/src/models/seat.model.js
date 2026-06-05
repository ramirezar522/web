import db from '../config/db.js';

const SeatAssignment = {
    // Obtener los asientos asignados a una reserva específica
    findByBookingId: async (bookingId) => {
        const query = 'SELECT * FROM seat_assignments WHERE booking_id = $1';
        const { rows } = await db.query(query, [bookingId]);
        return rows;
    },

    // Registrar la ocupación de un asiento (ej: 'A1', 'B5')
    create: async (seat_number, booking_id) => {
        const query = `
            INSERT INTO seat_assignments (seat_number, booking_id)
            VALUES ($1, $2) RETURNING *`;
        const { rows } = await db.query(query, [seat_number, booking_id]);
        return rows[0];
    },

    // Verifica si un asiento ya está ocupado para una función específica, considerando solo las reservas confirmadas
    checkAvailability: async (screeningId, seatNumber) => {
        const query = `
            SELECT sa.* FROM seat_assignments sa
            JOIN bookings b ON sa.booking_id = b.booking_id
            WHERE b.screening_id = $1 
            AND sa.seat_number = $2 
            AND b.booking_status = 'Confirmada'`;
        const { rows } = await db.query(query, [screeningId, seatNumber]);
        
        // Retorna true si el asiento está libre
        return rows.length === 0; 
    }
};

export default SeatAssignment;