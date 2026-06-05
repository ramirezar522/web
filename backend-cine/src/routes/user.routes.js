import { Router } from 'express';
import { getUsers, createUser } from '../controllers/user.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';
import { validateUser } from '../middlewares/user.validator.js';
import userSchema from '../schemas/user.schema.js';

const router = Router();

/**
 * RUTAS DE USUARIOS
 * Solo los usuarios autenticados con rol de GERENTE pueden gestionar usuarios.
 */

// Obtener lista de usuarios
router.get('/', authMiddleware, isGerente, getUsers);

// Registrar un nuevo usuario (con validación de esquema Zod)
router.post('/', authMiddleware, isGerente, validateUser, createUser);

export default router;