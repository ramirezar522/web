import Booking from '../models/booking.model.js';
import db from '../config/db.js';
import { sendTicketEmail as sendEmailUtil } from '../../utils/mailer.hadle.js';

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createBooking = async (req, res) => {
    try {
        const newBooking = await Booking.create(req.body);
        res.status(201).json(newBooking);
    } catch (error) {
        // Manejo de error de llave foránea en PostgreSQL (muy común en Sistemas)
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "Error de referencia: Verifique que el cliente, la función y el usuario existan" 
            });
        }
        res.status(500).json({ error: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const updated = await Booking.updateStatus(req.params.id, 'Cancelada');
        if (!updated) return res.status(404).json({ message: "Reserva no encontrada" });
        res.json({ message: "Reserva cancelada", data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendTicketEmail = async (req, res) => {
    const { id } = req.params;
    const { totalAmount, email } = req.body;

    try {
        // 1. Obtener detalles de la reserva
        const bookingQuery = `
            SELECT 
                b.booking_id,
                m.title as movie_title,
                s.date_time as screening_time,
                r.room_number,
                r.room_type
            FROM bookings b
            JOIN screenings s ON b.screening_id = s.screening_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN rooms r ON s.room_id = r.room_id
            WHERE b.booking_id = $1`;
        
        const { rows: bookingRows } = await db.query(bookingQuery, [id]);
        if (bookingRows.length === 0) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }
        
        const booking = bookingRows[0];

        // 2. Obtener asientos
        const { rows: seatRows } = await db.query(
            'SELECT seat_number FROM seat_assignments WHERE booking_id = $1',
            [id]
        );
        const seatsList = seatRows.map(r => r.seat_number).sort().join(', ');

        // 3. Determinar email de envío
        const recipientEmail = email || req.user.email;

        // 4. Calcular monto total
        const ticketPrices = { '2D': 8, '3D': 10, 'VIP': 15 };
        const pricePerSeat = ticketPrices[booking.room_type] || 8;
        const finalAmount = totalAmount || (seatRows.length * pricePerSeat);

        // 5. Formatear fecha/hora
        const dateObj = new Date(booking.screening_time);
        const formattedDate = dateObj.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = dateObj.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // 6. Enviar correo
        const qrData = `CINELUX-${booking.booking_id}-${Date.now()}`;
        const previewUrl = await sendEmailUtil(recipientEmail, {
            booking_id: booking.booking_id,
            movie_title: booking.movie_title,
            date: formattedDate,
            time: formattedTime,
            room: `${booking.room_number} (${booking.room_type})`,
            seats: seatsList || 'Ninguno',
            totalAmount: finalAmount,
            qrData
        });

        res.json({ 
            message: "Ticket enviado por correo con éxito", 
            previewUrl 
        });
    } catch (error) {
        console.error("Error al enviar ticket por correo:", error);
        res.status(500).json({ error: error.message });
    }
};
