import { Router } from 'express';
import { login, register, getProfile, recoverPassword, updateProfile, googleLogin } from '../controllers/auth.controller.js';
import { authMiddleware, isGerente } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// POST /api/auth/login
// PÚBLICO: Acceso al sistema para todo el personal
router.post('/login', authLimiter, login);

// POST /api/auth/google
// PÚBLICO: Acceso con Google
router.post('/google', authLimiter, googleLogin);

// POST /api/auth/register
// PÚBLICO: Registro de nuevo personal/usuarios
router.post('/register', authLimiter, register);

// GET /api/auth/me
// Obtener los datos del usuario logueado actualmente
// Privado (Requiere Token)
router.get('/me', authMiddleware, getProfile);

// PUT /api/auth/me
// Actualizar datos del perfil del usuario logueado
// Privado (Requiere Token)
router.put('/me', authMiddleware, updateProfile);

//ruta para solicitar recuperar contraseña
router.post('/recover-password', recoverPassword);

export default router;