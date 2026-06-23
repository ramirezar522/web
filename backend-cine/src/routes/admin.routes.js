import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

/**
 * @route   POST /api/admin/update-posters
 * @desc    One-time migration to set official movie poster URLs
 */
router.post('/update-posters', async (req, res) => {
    try {
        const posterUpdates = [
            {
                movie_id: 1,
                title: 'Dune: Parte Dos',
                poster_url: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg'
            },
            {
                movie_id: 2,
                title: 'Oppenheimer',
                poster_url: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
            },
            {
                movie_id: 3,
                title: 'Spider-Man: Across the Spider-Verse',
                poster_url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
            },
            {
                movie_id: 4,
                title: 'John Wick 4',
                poster_url: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg'
            },
            {
                movie_id: 5,
                title: 'Barbie',
                poster_url: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg'
            },
            {
                movie_id: 6,
                title: 'The Conjuring 4',
                poster_url: 'https://image.tmdb.org/t/p/w500/xbSuFiJbbBWCkyCCKIMfuDCA4yV.jpg'
            }
        ];

        for (const movie of posterUpdates) {
            await db.query(
                'UPDATE movies SET poster_url = $1 WHERE movie_id = $2',
                [movie.poster_url, movie.movie_id]
            );
        }

        res.json({ 
            message: 'Posters actualizados correctamente', 
            updated: posterUpdates.length 
        });
    } catch (error) {
        console.error('Error updating posters:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    Fetch real dashboard metrics (active bookings, movies playing, available rooms, revenue)
 */
router.get('/dashboard-stats', async (req, res) => {
    try {
        const bookingsCount = await db.query("SELECT COUNT(*) FROM bookings WHERE booking_status = 'Confirmada'");
        const moviesCount = await db.query("SELECT COUNT(*) FROM movies WHERE status = 'Activa'");
        const roomsCount = await db.query("SELECT COUNT(*) FROM rooms WHERE room_status = 'Disponible'");
        
        // Calculate revenue
        const revenueQuery = `
            SELECT r.room_type, COUNT(sa.assignment_id) as seats_count
            FROM seat_assignments sa
            JOIN bookings b ON sa.booking_id = b.booking_id
            JOIN screenings s ON b.screening_id = s.screening_id
            JOIN rooms r ON s.room_id = r.room_id
            WHERE b.booking_status = 'Confirmada'
            GROUP BY r.room_type`;
        const revenueRes = await db.query(revenueQuery);
        
        const prices = { '2D': 8, '3D': 10, 'VIP': 15 };
        let totalRevenue = 0;
        for (const row of revenueRes.rows) {
            const price = prices[row.room_type] || 8;
            totalRevenue += parseInt(row.seats_count, 10) * price;
        }

        // Today sales
        const todayRevenueQuery = `
            SELECT r.room_type, COUNT(sa.assignment_id) as seats_count
            FROM seat_assignments sa
            JOIN bookings b ON sa.booking_id = b.booking_id
            JOIN screenings s ON b.screening_id = s.screening_id
            JOIN rooms r ON s.room_id = r.room_id
            WHERE b.booking_status = 'Confirmada' AND b.created_at >= CURRENT_DATE
            GROUP BY r.room_type`;
        const todayRevenueRes = await db.query(todayRevenueQuery);
        let todaySales = 0;
        for (const row of todayRevenueRes.rows) {
            const price = prices[row.room_type] || 8;
            todaySales += parseInt(row.seats_count, 10) * price;
        }

        res.json({
            activeBookings: parseInt(bookingsCount.rows[0].count, 10),
            moviesPlaying: parseInt(moviesCount.rows[0].count, 10),
            availableRooms: parseInt(roomsCount.rows[0].count, 10),
            totalRevenue,
            todaySales
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
