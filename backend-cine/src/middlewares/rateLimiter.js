import rateLimit from 'express-rate-limit';

// Global rate limiter for overall API abuse prevention
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.'
  }
});

// Authentication rate limiter to prevent brute-force attacks on credentials
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión o registro desde esta IP, por favor intente de nuevo en 15 minutos.'
  }
});

// Booking rate limiter to prevent ticket reservation scalping or spam
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 bookings per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de reservas excedido para esta IP. Por favor intente de nuevo en una hora.'
  }
});
