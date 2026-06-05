import { Router } from 'express';
import * as screeningController from '../controllers/screening.controller.js';
import { validateScreening } from '../middlewares/screening.validator.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';

const router = Router();

// --- RUTAS DE FUNCIONES (SCREENINGS) ---

/**
 * @route   GET /api/screenings
 * @desc    PÚBLICO: Listar funciones disponibles en cartelera
 */
router.get('/', screeningController.getAllScreenings); // 💡 Se eliminó authMiddleware

/**
 * @route   GET /api/screenings/:id
 * @desc    PRIVADO: Consultar detalles técnicos de una función específica
 */
// router.get('/:id', authMiddleware, screeningController.getScreeningByMovieId);

/**
 * @route   POST /api/screenings
 * @desc    SOLO GERENTE: Programar nuevas funciones 
 */
router.post('/', 
    authMiddleware, 
    isGerente, 
    validateScreening, 
    screeningController.createScreening
);

/**
 * @route   DELETE /api/screenings/:id
 * @desc    SOLO GERENTE: Eliminar una función 
 */
router.delete('/:id', 
    authMiddleware, 
    isGerente, 
    screeningController.deleteScreening
);

export default router;