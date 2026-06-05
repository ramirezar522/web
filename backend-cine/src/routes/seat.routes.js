import { Router } from 'express';
import * as seatController from '../controllers/seat.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateSeat } from '../middlewares/seat.validator.js';

const router = Router();

// --- RUTAS DE ASIGNACIÓN DE ASIENTOS ---

/**
 * @route   GET /api/seats/booking/:bookingId
 * @desc    PÚBLICO: Ver los asientos específicos vinculados a una reserva
 * @access  Cualquier usuario
 */
router.get('/booking/:bookingId', seatController.getSeatsByBooking);

/**
 * @route   GET /api/seats/availability/:screeningId
 * @desc    PÚBLICO: Ver asientos ocupados para una función
 * @access  Cualquier usuario
 */
router.get('/availability/:screeningId', seatController.getOccupiedSeats);

/**
 * @route   POST /api/seats/assign
 * @desc    OPERACIÓN: Asignar múltiples asientos a una reserva en proceso de venta
 * @access  Privado (Cualquier empleado logueado)
 */
router.post('/assign', 
    authMiddleware, 
    validateSeat, 
    seatController.assignSeats
);

export default router;