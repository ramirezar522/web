import { Router } from 'express';
import * as movementController from '../controllers/movement.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';
import { validateMovement } from '../middlewares/movement.validator.js';

const router = Router();

/**
 * @route   GET /api/movements
 * @desc    HISTORIAL: Ver todos los movimientos de entrada y salida de stock
 */
router.get('/', authMiddleware, movementController.getAllMovements);

/**
 * @route   POST /api/movements
 * @desc    REGISTRO: Crear un nuevo movimiento de inventario (Solo Gerente)
 * Nota: Esto disparará el Trigger en PostgreSQL para actualizar el stock.
 */
router.post('/', 
    authMiddleware, 
    isGerente, 
    validateMovement, 
    movementController.createMovement
);

export default router;