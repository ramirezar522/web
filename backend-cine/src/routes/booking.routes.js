import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import * as seatController from '../controllers/seat.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

/**
 * @route   GET /api/bookings
 * @descripcion   Obtener listado de ventas/reservas 
 */
router.get('/', authMiddleware, bookingController.getAllBookings);

/**
 * @route   POST /api/bookings
 * @desc    Registrar una nueva venta/reserva
 */
router.post('/', authMiddleware, bookingController.createBooking);

/**
 * @route   POST /api/bookings/assign-seats
 * @desc    Vincular asientos específicos a una reserva ya creada
 */
router.post('/assign-seats', authMiddleware, seatController.assignSeats);

/**
 * @route   POST /api/bookings/:id/send-email
 * @desc    Enviar el ticket al correo del usuario
 */
router.post('/:id/send-email', authMiddleware, bookingController.sendTicketEmail);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cambiar estado de reserva a 'Cancelada'
 */
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

export default router;