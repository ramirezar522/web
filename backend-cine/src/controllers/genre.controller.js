import Genre from '../models/genre.model.js';

export const getAllGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll();
        res.json(genres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createGenre = async (req, res) => {
    try {
        const newGenre = await Genre.create(req.body.name);
        res.status(201).json(newGenre);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para actualizar un género existente
export const updateGenre = async (req, res) => {
    const { id } = req.params; // Captura el ID de la ruta
    const { name } = req.body; // Captura el nuevo nombre del género
    
    try {
        // Ejecutamos la consulta usando el pool de conexiones
        const result = await query('UPDATE genres SET name = $1 WHERE id = $2', [name, id]);
        
        // Verificamos si realmente se actualizó algo
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Género no encontrado" });
        }

        res.json({ message: "Género actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el género en la base de datos" });
    }
};

export const deleteGenre = async (req, res) => {
    try {
        await Genre.delete(req.params.id);
        res.json({ message: "Género eliminado correctamente" });
    } catch (error) {
        // Manejo de integridad referencial para películas
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar: hay películas registradas con este género" 
            });
        }
        res.status(500).json({ error: error.message });
    }
};
