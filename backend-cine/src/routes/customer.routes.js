import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';
import { validateCustomer } from '../middlewares/customer.validator.js';

const router = Router();

// --- RUTAS DE CLIENTES ---

/**
 * @route   GET /api/customers
 * @desc    CUALQUIER USUARIO LOGUEADO: Ver lista completa de clientes registrados
 */
router.get('/', authMiddleware, customerController.getAllCustomers);

/**
 * @route   GET /api/customers/cedula/:cedula
 * @desc    BÚSQUEDA RÁPIDA: Encontrar cliente por cédula 
 */
router.get('/cedula/:cedula', authMiddleware, customerController.getCustomerByCedula);

/**
 * @route   POST /api/customers
 * @desc    REGISTRO: Crear un nuevo cliente durante el proceso de venta
 */
router.post('/', authMiddleware, validateCustomer, customerController.createCustomer);

/**
 * @route   PUT /api/customers/:id
 * @desc    EDICIÓN: Actualizar datos de cliente (Gerente)
 */
router.put('/:id', 
    authMiddleware, 
    isGerente, 
    validateCustomer, 
    customerController.updateCustomer
);

export default router;