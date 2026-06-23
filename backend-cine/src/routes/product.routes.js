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

router.post('/', authMiddleware, isGerente, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar un producto en el inventario (Gerente)
 */
router.put('/:id', authMiddleware, isGerente, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar un producto del inventario (Gerente)
 */
router.delete('/:id', authMiddleware, isGerente, productController.deleteProduct);

export default router;