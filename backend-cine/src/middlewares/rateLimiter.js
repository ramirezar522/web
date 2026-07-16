import rateLimit from 'express-rate-limit';

// Store for IPs blocked for exactly 1 minute
const blockedIPs = new Map();

// Helper middleware to check if an IP is currently blocked
export const checkBlockedIPs = (req, res, next) => {
  const ip = req.ip;
  const blockExpiry = blockedIPs.get(ip);
  
  if (blockExpiry) {
    if (Date.now() < blockExpiry) {
      const remainingSeconds = Math.ceil((blockExpiry - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Acceso bloqueado temporalmente por exceso de peticiones. Intente de nuevo en ${remainingSeconds} segundos.`
      });
    } else {
      blockedIPs.delete(ip); // Expiry passed, unblock
    }
  }
  next();
};

// Custom handler to trigger the 1-minute block when limits are exceeded
const blockHandler = (req, res, next, options) => {
  blockedIPs.set(req.ip, Date.now() + 60 * 1000); // Block IP for exactly 60 seconds
  res.status(options.statusCode).json(options.message);
};

// Global rate limiter: 150 requests per 5 minutes (allows smooth admin panel navigation)
export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  handler: blockHandler,
  message: {
    success: false,
    message: 'Límite de peticiones excedido. Tu IP ha sido bloqueada por 1 minuto.'
  }
});

// Authentication rate limiter: 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: blockHandler,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Tu IP ha sido bloqueada por 1 minuto.'
  }
});

// Booking rate limiter: 3 ticket bookings per 15 minutes
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: blockHandler,
  message: {
    success: false,
    message: 'Límite de compras excedido. Tu IP ha sido bloqueada por 1 minuto.'
  }
});

// Reset rate limit counts and 1-minute blocks for an IP on successful action/login
export const resetLimiterKeys = (ip) => {
  try {
    globalLimiter.resetKey(ip);
    authLimiter.resetKey(ip);
    blockedIPs.delete(ip);
    console.log(`[RateLimit] Reset counts and blocks for IP=${ip}`);
  } catch (err) {
    console.error(`[RateLimit] Error resetting keys for IP=${ip}:`, err.message);
  }
};
