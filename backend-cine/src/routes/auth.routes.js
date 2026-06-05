import { Router } from 'express';
import { login, register, getProfile, recoverPassword } from '../controllers/auth.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';

const router = Router();

// POST /api/auth/login
// PÚBLICO: Acceso al sistema para todo el personal
router.post('/login', login);

// POST /api/auth/register
// PÚBLICO: Registro de nuevo personal/usuarios
router.post('/register', register);

// GET /api/auth/me
// Obtener los datos del usuario logueado actualmente
// Privado (Requiere Token)
router.get('/me', authMiddleware, getProfile);

//ruta para solicitar recuperar contraseña
router.post('/recover-password', recoverPassword);

export default router;