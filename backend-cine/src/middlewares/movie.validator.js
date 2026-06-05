export const validateMovie = (req, res, next) => {
    const { title, director, duration, status, genre_id } = req.body;
    
    const validStatus = ['Activa', 'Desactiva'];

    // Validación de campos requeridos
    if (!title || !genre_id) {
        return res.status(400).json({ 
            message: "El título y el ID de género son obligatorios" 
        });
    }

    // Validación del ENUM de estado
    if (status && !validStatus.includes(status)) {
        return res.status(400).json({ 
            message: "Estado no válido. Debe ser 'Activa' o 'Desactiva'" 
        });
    }

    // Validación de tipo de dato para la llave foránea
    if (isNaN(genre_id)) {
        return res.status(400).json({ message: "El genre_id debe ser un número" });
    }

    // Si todo es correcto, pasamos al controlador
    next();
};
