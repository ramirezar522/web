import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Importación de rutas 
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import movieRoutes from './routes/movie.routes.js';
import genreRoutes from './routes/genre.routes.js';
import roomRoutes from './routes/room.routes.js';
import screeningRoutes from './routes/screening.routes.js';
import seatRoutes from './routes/seat.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import movementRoutes from './routes/movement.routes.js';

const app = express();

// --- MIDDLEWARES GLOBALES ---
app.use(cors()); // Permite peticiones desde el frontend
app.use(morgan('dev')); // Registro de peticiones en consola para depuración
app.use(express.json()); // Habilita la lectura de cuerpos JSON en las peticiones
app.use(express.urlencoded({ extended: true })); // Habilita la lectura de datos de formularios

// --- DEFINICIÓN DE RUTAS (API ENDPOINTS) ---

// Módulo de Seguridad y Usuarios
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Módulo de Cine y Cartelera
app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/seats', seatRoutes);

// Módulo de Ventas y Clientes
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);

// Módulo de Suministros e Inventario 
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/movements', movementRoutes);

// --- MANEJO DE RUTAS NO ENCONTRADAS ---
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada en el sistema del cine" });
});

// --- CONFIGURACIÓN DEL PUERTO ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor en: http://localhost:${PORT}`);
  console.log(`Proyecto Cine`);
});

export default app;