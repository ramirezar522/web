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
                poster_url: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg'
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
                poster_url: 'https://image.tmdb.org/t/p/w500/jVbHMsbnMAvi1fOFijdHqKSVGtn.jpg'
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

export default router;
