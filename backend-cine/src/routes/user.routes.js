import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
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

// Actualizar un usuario
router.put('/:id', authMiddleware, isGerente, validateUser, updateUser);

// Eliminar un usuario
router.delete('/:id', authMiddleware, isGerente, deleteUser);

export default router;