import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';
import { validateCategory } from '../middlewares/category.validator.js';

const router = Router();

// --- RUTAS DE CATEGORÍAS DE PRODUCTOS ---

/**
 * @route   GET /api/categories
 * @descripcion   CUALQUIER USUARIO LOGUEADO: Ver categorías para filtrar productos
 */
router.get('/', authMiddleware, categoryController.getAllCategories);

/**
 * @route   POST /api/categories
 * @desc    SOLO GERENTE: Crear nuevas categorías (ej. "Combos", "Snacks")
 */
router.post('/', 
    authMiddleware, 
    isGerente, 
    validateCategory, 
    categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    SOLO GERENTE: Actualizar nombre de una categoría
 */
router.put('/:id', 
    authMiddleware, 
    isGerente, 
    validateCategory, 
    categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    SOLO GERENTE: Eliminar categorías (si no tienen productos asociados)
 */
router.delete('/:id', 
    authMiddleware, 
    isGerente, 
    categoryController.deleteCategory
);

export default router;