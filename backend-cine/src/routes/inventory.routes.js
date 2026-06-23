import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';
import { validateProduct } from '../middlewares/product.validator.js';

const router = Router();

// --- SECCIÓN: PRODUCTOS ---

/**
 * @route   GET /api/inventory/products
 * @desc    CUALQUIER EMPLEADO: Ver catálogo completo y stock actual
 */
router.get('/products', authMiddleware, productController.getAllProducts);

/**
 * @route   GET /api/inventory/products/alerts
 * @desc    ALERTAS: Listar productos que están por debajo del stock mínimo
 */
router.get('/products/alerts', authMiddleware, productController.getInventoryAlerts);

/**
 * @route   POST /api/inventory/products
 * @desc    SOLO GERENTE: Registrar nuevos productos con validación técnica
 */
router.post('/products', 
    authMiddleware, 
    isGerente, 
    validateProduct, 
    productController.createProduct
);

/**
 * @route   PUT /api/inventory/products/:id
 * @desc    SOLO GERENTE: Actualizar un producto existente
 */
router.put('/products/:id',
    authMiddleware,
    isGerente,
    validateProduct,
    productController.updateProduct
);

/**
 * @route   DELETE /api/inventory/products/:id
 * @desc    SOLO GERENTE: Eliminar un producto
 */
router.delete('/products/:id',
    authMiddleware,
    isGerente,
    productController.deleteProduct
);

// --- SECCIÓN: CATEGORÍAS ---

/**
 * @route   GET /api/inventory/categories
 * @desc    CUALQUIER EMPLEADO: Listar categorías disponibles
 */
router.get('/categories', authMiddleware, categoryController.getAllCategories);

/**
 * @route   POST /api/inventory/categories
 * @desc    SOLO GERENTE: Crear nuevas familias de productos
 */
router.post('/categories', authMiddleware, isGerente, categoryController.createCategory);

export default router;