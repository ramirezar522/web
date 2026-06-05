import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Consultar el stock actual y lista de productos
 * @access  Privado (Cualquier empleado logueado)
 */
router.get('/', authMiddleware, productController.getAllProducts);

/**
 * @route   POST /api/products
 * @desc    Crear un nuevo producto en el inventario
 * @access  Privado (Solo Gerente)
 */
router.post('/', authMiddleware, isGerente, productController.createProduct);

export default router;