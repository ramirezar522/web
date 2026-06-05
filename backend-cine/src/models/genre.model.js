import db from '../config/db.js';

const Genre = {
    // Listar todos los géneros ordenados 
    findAll: async () => {
        const query = 'SELECT * FROM genres ORDER BY name ASC';
        const { rows } = await db.query(query);
        return rows;
    },

    // Buscar un género específico por su ID
    findById: async (id) => {
        const query = 'SELECT * FROM genres WHERE genre_id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    // Registrar un nuevo género (ej: Sci-Fi, Drama)
    create: async (name) => {
        const query = 'INSERT INTO genres (name) VALUES ($1) RETURNING *';
        const { rows } = await db.query(query, [name]);
        return rows[0];
    },

    // Actualizar el nombre de un género existente
    update: async (id, name) => {
        const query = 'UPDATE genres SET name = $1 WHERE genre_id = $2 RETURNING *';
        const { rows } = await db.query(query, [name, id]);
        return rows[0];
    },

    // Eliminar un género del sistema
    delete: async (id) => {
        // Nota: La base de datos protegerá la integridad si hay películas asociadas
        const query = 'DELETE FROM genres WHERE genre_id = $1';
        await db.query(query, [id]);
        return true;
    }
};

export default Genre;