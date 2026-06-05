export const validateProduct = (req, res, next) => {
    const { name, category_id, min_stock } = req.body;

    // Validación de campos obligatorios
    if (!name || !category_id) {
        return res.status(400).json({ 
            message: "El nombre y la categoría son obligatorios" 
        });
    }

    // Validación de stock mínimo 
    if (min_stock !== undefined && (isNaN(min_stock) || min_stock < 0)) {
        return res.status(400).json({ 
            message: "El stock mínimo debe ser un número positivo" 
        });
    }
    next();
};
