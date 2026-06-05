export const validateGenre = (req, res, next) => {
    const { name } = req.body;

    // Validación: que el nombre exista y no sea solo espacios en blanco
    if (!name || name.trim() === "") {
        return res.status(400).json({ 
            message: "El nombre del género es obligatorio" 
        });
    }

    // Validación: coincidencia con el límite de caracteres de la columna en la BD
    if (name.length > 100) {
        return res.status(400).json({ 
            message: "El nombre del género no puede exceder los 100 caracteres" 
        });
    }

    // Si pasa las validaciones, sigue al controlador
    next();
};
