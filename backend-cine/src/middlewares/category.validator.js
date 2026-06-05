export const validateCategory = (req, res, next) => {
    const { name } = req.body;

    // Validación de presencia y contenido (evita strings vacíos)
    if (!name || name.trim() === "") {
        return res.status(400).json({ 
            message: "El nombre de la categoría es obligatorio" 
        });
    }

    // Validación de longitud para que coincida con el VARCHAR de la BD
    if (name.length > 100) {
        return res.status(400).json({ 
            message: "El nombre no puede exceder los 100 caracteres" 
        });
    }

    // Todo correcto, seguimos al controlador
    next();
};
