-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed Roles
INSERT INTO roles (role_id, role_name) VALUES
(1, 'GERENTE'),
(2, 'EMPLEADO')
ON CONFLICT (role_id) DO NOTHING;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    status VARCHAR(50) DEFAULT 'Activo'
);

-- Seed Users (password is 'admin123' encrypted with bcrypt)
INSERT INTO users (user_id, first_name, last_name, email, password, role_id, status) VALUES
(1, 'Gerente', 'Principal', 'gerente@cinelux.com', '$2b$10$Z4di0.Ea8n7PZ/GO4Uvcqux0lNDV8zAvJ1hjxBEDONqWbtuR4koFq', 1, 'Activo'),
(2, 'Empleado', 'Cine', 'empleado@cinelux.com', '$2b$10$Z4di0.Ea8n7PZ/GO4Uvcqux0lNDV8zAvJ1hjxBEDONqWbtuR4koFq', 2, 'Activo')
ON CONFLICT (email) DO NOTHING;

-- 3. Genres table
CREATE TABLE IF NOT EXISTS genres (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Seed Genres
INSERT INTO genres (genre_id, name) VALUES
(1, 'Acción'),
(2, 'Drama'),
(3, 'Comedia'),
(4, 'Terror'),
(5, 'Ciencia Ficción'),
(6, 'Romance'),
(7, 'Animación')
ON CONFLICT (genre_id) DO NOTHING;

-- 4. Movies table
CREATE TABLE IF NOT EXISTS movies (
    movie_id SERIAL PRIMARY KEY,
    id INTEGER, -- Alias for movie_id
    title VARCHAR(255) NOT NULL,
    director VARCHAR(255),
    year INTEGER,
    genre VARCHAR(100),
    duration INTEGER,
    poster_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Activa',
    genre_id INTEGER REFERENCES genres(genre_id)
);

-- Seed Movies
INSERT INTO movies (movie_id, id, title, director, duration, poster_url, status, genre_id, genre) VALUES
(1, 1, 'Dune: Parte Dos', 'Denis Villeneuve', 166, 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg', 'Activa', 5, 'Ciencia Ficción'),
(2, 2, 'Oppenheimer', 'Christopher Nolan', 180, 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'Activa', 2, 'Drama'),
(3, 3, 'Spider-Man: Across the Spider-Verse', 'Joaquim Dos Santos', 140, 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', 'Activa', 7, 'Animación'),
(4, 4, 'John Wick 4', 'Chad Stahelski', 169, 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', 'Activa', 1, 'Acción'),
(5, 5, 'Barbie', 'Greta Gerwig', 114, 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', 'Activa', 3, 'Comedia'),
(6, 6, 'The Conjuring 4', 'James Wan', 112, 'https://image.tmdb.org/t/p/w500/xbSuFiJbbBWCkyCCKIMfuDCA4yV.jpg', 'Activa', 4, 'Terror')
ON CONFLICT (movie_id) DO NOTHING;

-- 5. Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    total_capacity INTEGER NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    room_status VARCHAR(50) DEFAULT 'Disponible'
);

-- Seed Rooms
INSERT INTO rooms (room_id, room_number, total_capacity, room_type, room_status) VALUES
(1, 'Sala 1', 120, '2D', 'Disponible'),
(2, 'Sala 2', 80, '3D', 'Disponible'),
(3, 'Sala VIP', 40, 'VIP', 'Disponible')
ON CONFLICT (room_id) DO NOTHING;

-- 6. Screenings table
CREATE TABLE IF NOT EXISTS screenings (
    screening_id SERIAL PRIMARY KEY,
    date_time TIMESTAMP NOT NULL,
    movie_id INTEGER REFERENCES movies(movie_id),
    room_id INTEGER REFERENCES rooms(room_id)
);

-- Seed Screenings (using today's date for fresh listings)
INSERT INTO screenings (screening_id, date_time, movie_id, room_id) VALUES
(1, CURRENT_DATE + TIME '14:00:00', 1, 1),
(2, CURRENT_DATE + TIME '17:30:00', 1, 2),
(3, CURRENT_DATE + TIME '21:00:00', 1, 3),
(4, CURRENT_DATE + TIME '15:00:00', 2, 1),
(5, CURRENT_DATE + TIME '19:00:00', 2, 3),
(6, CURRENT_DATE + TIME '13:00:00', 3, 2),
(7, CURRENT_DATE + TIME '16:30:00', 3, 1),
(8, CURRENT_DATE + TIME '20:00:00', 4, 1),
(9, (CURRENT_DATE + 1) + TIME '18:00:00', 4, 2),
(10, CURRENT_DATE + TIME '12:00:00', 5, 1),
(11, (CURRENT_DATE + 1) + TIME '15:30:00', 5, 3),
(12, CURRENT_DATE + TIME '22:00:00', 6, 2)
ON CONFLICT (screening_id) DO NOTHING;

-- 7. Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cedula VARCHAR(50) UNIQUE,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE
);

-- Seed Customer
INSERT INTO customers (customer_id, first_name, last_name, cedula, phone, email) VALUES
(1, 'Roberto', 'Sánchez', 'V-12345678', '0414-1234567', 'roberto@email.com')
ON CONFLICT (customer_id) DO NOTHING;

-- 8. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    screening_id INTEGER REFERENCES screenings(screening_id),
    user_id INTEGER REFERENCES users(user_id),
    booking_status VARCHAR(50) DEFAULT 'Confirmada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Bookings
INSERT INTO bookings (booking_id, customer_id, screening_id, user_id, booking_status, created_at) VALUES
(1001, 1, 1, 1, 'Confirmada', CURRENT_TIMESTAMP - INTERVAL '5 minutes')
ON CONFLICT (booking_id) DO NOTHING;

-- 9. Seat Assignments table
CREATE TABLE IF NOT EXISTS seat_assignments (
    assignment_id SERIAL PRIMARY KEY,
    seat_number VARCHAR(10) NOT NULL,
    booking_id INTEGER REFERENCES bookings(booking_id)
);

-- Seed Seat Assignments
INSERT INTO seat_assignments (seat_number, booking_id) VALUES
('A3', 1001),
('A4', 1001),
('B5', 1001)
ON CONFLICT (assignment_id) DO NOTHING;

-- 10. Product Categories table
CREATE TABLE IF NOT EXISTS product_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Seed Product Categories
INSERT INTO product_categories (category_id, name) VALUES
(1, 'Snacks'),
(2, 'Bebidas'),
(3, 'Confitería')
ON CONFLICT (category_id) DO NOTHING;

-- 11. Products table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    category_id INTEGER REFERENCES product_categories(category_id)
);

-- Seed Products
INSERT INTO products (product_id, name, current_stock, min_stock, category_id) VALUES
(1, 'Palomitas Medianas', 120, 40, 1),
(2, 'Refresco Mediano', 150, 30, 2),
(3, 'Palomitas Grandes', 15, 30, 1)
ON CONFLICT (product_id) DO NOTHING;

-- 12. Inventory Movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
    movement_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    product_id INTEGER REFERENCES products(product_id),
    movement_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Inventory Movements
INSERT INTO inventory_movements (movement_id, user_id, product_id, movement_type, quantity, created_at) VALUES
(1, 1, 1, 'Entrada', 120, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(2, 1, 2, 'Entrada', 150, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(3, 1, 3, 'Entrada', 15, CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (movement_id) DO NOTHING;

-- 13. Trigger to update product stock on inventory movements
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'Entrada' THEN
        UPDATE products 
        SET current_stock = current_stock + NEW.quantity
        WHERE product_id = NEW.product_id;
    ELSIF NEW.movement_type = 'Salida' THEN
        UPDATE products 
        SET current_stock = current_stock - NEW.quantity
        WHERE product_id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_stock ON inventory_movements;
CREATE TRIGGER trg_update_product_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();
