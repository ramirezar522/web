import Movie from '../models/movie.model.js';
import db from '../config/db.js';

export const getAllMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const genreId = req.query.genre_id ? parseInt(req.query.genre_id, 10) : null;
        const status = req.query.status;
        const search = req.query.search;
        
        let queryStr = `
            SELECT m.*, g.name as genre_name 
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.genre_id
            WHERE 1=1`;
        
        let countQueryStr = `
            SELECT COUNT(*) 
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.genre_id
            WHERE 1=1`;
            
        const queryParams = [];
        let paramCount = 0;
        
        if (genreId) {
            paramCount++;
            queryStr += ` AND m.genre_id = $${paramCount}`;
            countQueryStr += ` AND m.genre_id = $${paramCount}`;
            queryParams.push(genreId);
        }
        
        if (status && status !== 'todos') {
            paramCount++;
            queryStr += ` AND m.status = $${paramCount}`;
            countQueryStr += ` AND m.status = $${paramCount}`;
            queryParams.push(status);
        }
        
        if (search) {
            paramCount++;
            queryStr += ` AND (m.title ILIKE $${paramCount} OR m.director ILIKE $${paramCount})`;
            countQueryStr += ` AND (m.title ILIKE $${paramCount} OR m.director ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY m.title ASC`;
        
        const countRes = await db.query(countQueryStr, queryParams);
        const total = parseInt(countRes.rows[0].count, 10);
        
        if (page && limit) {
            const offset = (page - 1) * limit;
            paramCount++;
            queryStr += ` LIMIT $${paramCount}`;
            queryParams.push(limit);
            
            paramCount++;
            queryStr += ` OFFSET $${paramCount}`;
            queryParams.push(offset);
        }
        
        const { rows } = await db.query(queryStr, queryParams);
        
        if (page && limit) {
            return res.json({
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener películas: " + error.message });
    }
};

export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Película no encontrada" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createMovie = async (req, res) => {
    try {
        const newMovie = await Movie.create(req.body);
        res.status(201).json(newMovie);
    } catch (error) {
        // Manejo específico si el genre_id no existe en la tabla genres
        if (error.code === '23503') {
            return res.status(400).json({ message: "El género especificado no existe" });
        }
        res.status(500).json({ error: error.message });
    }
};

export const updateMovie = async (req, res) => {
    try {
        const updated = await Movie.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Película no encontrada" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para eliminar una película por ID
export const deleteMovie = async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de la URL
    try {
        const result = await query('DELETE FROM movies WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Película no encontrada" });
        }

        res.json({ message: "Película eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la película en la base de datos" });
    }
};
