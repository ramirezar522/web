import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import { verifyToken, isGerente } from '../middlewares/auth.js';
import { validateProduct } from '../middlewares/product.validator.js';

const router = Router();

// --- SECCIÓN: PRODUCTOS ---

/**
 * @route   GET /api/inventory/products
 * @desc    CUALQUIER EMPLEADO: Ver catálogo completo y stock actual
 */
router.get('/products', verifyToken, productController.getAllProducts);

/**
 * @route   GET /api/inventory/products/alerts
 * @desc    ALERTAS: Listar productos que están por debajo del stock mínimo
 */
router.get('/products/alerts', verifyToken, productController.getInventoryAlerts);

/**
 * @route   POST /api/inventory/products
 * @desc    SOLO GERENTE: Registrar nuevos productos con validación técnica
 */
router.post('/products', 
    verifyToken, 
    isGerente, 
    validateProduct, 
    productController.createProduct
);

// --- SECCIÓN: CATEGORÍAS ---

/**
 * @route   GET /api/inventory/categories
 * @desc    CUALQUIER EMPLEADO: Listar categorías disponibles
 */
router.get('/categories', verifyToken, categoryController.getAllCategories);

/**
 * @route   POST /api/inventory/categories
 * @desc    SOLO GERENTE: Crear nuevas familias de productos
 */
router.post('/categories', verifyToken, isGerente, categoryController.createCategory);

export default router;