import { Router } from 'express';
import * as movieController from '../controllers/movie.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';

const router = Router();

// --- RUTAS DE PELÍCULAS ---

/**
 * @route   GET /api/movies
 * @desc    PÚBLICO: Consultar todas las películas (Cartelera)
 */
router.get('/', movieController.getAllMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    PÚBLICO: Ver detalles de una película específica
 */
router.get('/:id', movieController.getMovieById);

/**
 * @route   POST /api/movies
 * @desc    SOLO GERENTE: Añadir una nueva película al sistema
 */
router.post('/', authMiddleware, isGerente, movieController.createMovie);

/**
 * @route   PUT /api/movies/:id
 * @desc    SOLO GERENTE: Editar información o estado de una película
 */
router.put('/:id', authMiddleware, isGerente, movieController.updateMovie);

/**
 * @route   DELETE /api/movies/:id
 * @desc    SOLO GERENTE: Eliminar película (si no tiene funciones activas)
 */
router.delete('/:id', authMiddleware, isGerente, movieController.deleteMovie);

export default router;