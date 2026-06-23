import Booking from '../models/booking.model.js';
import db from '../config/db.js';
import { sendTicketEmail as sendEmailUtil } from '../../utils/mailer.hadle.js';
import { verifyEmailDomain } from '../../utils/email.validator.js';

export const getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const status = req.query.status;
        const search = req.query.search;
        
        let queryStr = `
            SELECT 
                b.booking_id, b.created_at, b.booking_status,
                c.first_name || ' ' || c.last_name as customer_name,
                c.email as customer_email,
                m.movie_id,
                m.title as movie_title,
                m.director,
                m.duration,
                m.poster_url,
                m.genre as genre_name,
                s.date_time as screening_time,
                u.first_name as staff_name
            FROM bookings b
            JOIN customers c ON b.customer_id = c.customer_id
            JOIN screenings s ON b.screening_id = s.screening_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN users u ON b.user_id = u.user_id
            WHERE 1=1`;
        
        let countQueryStr = `
            SELECT COUNT(*) 
            FROM bookings b
            JOIN customers c ON b.customer_id = c.customer_id
            JOIN screenings s ON b.screening_id = s.screening_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN users u ON b.user_id = u.user_id
            WHERE 1=1`;
            
        const queryParams = [];
        let paramCount = 0;
        
        if (status && status !== 'todos') {
            paramCount++;
            queryStr += ` AND b.booking_status = $${paramCount}`;
            countQueryStr += ` AND b.booking_status = $${paramCount}`;
            queryParams.push(status);
        }
        
        if (search) {
            paramCount++;
            queryStr += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR m.title ILIKE $${paramCount})`;
            countQueryStr += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR m.title ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY b.created_at DESC`;
        
        const countRes = await db.query(countQueryStr, queryParams);
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
        
        const { rows } = await db.query(queryStr, queryParams);
        
        if (page && limit) {
            return res.json({
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        
        res.json(rows);
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
        let recipientEmail = email;
        if (!recipientEmail && req.user && req.user.id) {
            const userRow = await db.query('SELECT email FROM users WHERE user_id = $1', [req.user.id]);
            if (userRow.rows.length > 0) {
                recipientEmail = userRow.rows[0].email;
            }
        }

        if (!recipientEmail) {
            return res.status(400).json({ message: "No se proporcionó correo de destino ni se encontró en la cuenta registrada." });
        }

        // Verificar si el correo es real
        const isRealEmail = await verifyEmailDomain(recipientEmail);
        if (!isRealEmail) {
            return res.status(400).json({ message: "El correo electrónico de destino no es válido o no existe." });
        }

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
