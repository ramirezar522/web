import db from '../config/db.js';

const Movie = {
    // Obtener películas con el nombre de su género para la cartelera
    findAll: async () => {
        const query = `
            SELECT m.*, g.name as genre_name 
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.genre_id
            ORDER BY m.title ASC`;
        const { rows } = await db.query(query);
        return rows;
    },

    // Buscar una película específica con su género
    findById: async (id) => {
        const query = `
            SELECT m.*, g.name as genre_name 
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.genre_id
            WHERE m.movie_id = $1`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    // Registrar nueva película 
    create: async (data) => {
        const { title, director, duration, poster_url, status, genre_id } = data;
        const query = `
            INSERT INTO movies (title, director, duration, poster_url, status, genre_id)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
        const values = [
            title, 
            director, 
            duration, 
            poster_url || 'null', 
            status || 'Activa', 
            genre_id
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Actualizar datos de la película (incluyendo poster y estado)
    update: async (id, data) => {
        const { title, director, duration, poster_url, status, genre_id } = data;
        const query = `
            UPDATE movies 
            SET title = $1, director = $2, duration = $3, 
                poster_url = $4, status = $5, genre_id = $6
            WHERE movie_id = $7 
            RETURNING *`;
        const values = [title, director, duration, poster_url, status, genre_id, id];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Eliminar película
    delete: async (id) => {
        // La integridad referencial de PostgreSQL evitará el borrado si hay screenings
        await db.query('DELETE FROM movies WHERE movie_id = $1', [id]);
        return true;
    }
};

export default Movie;