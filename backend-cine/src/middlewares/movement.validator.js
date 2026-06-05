export const validateMovement = (req, res, next) => {
    const { user_id, product_id, movement_type, quantity } = req.body;

    // Validación de presencia de datos
    if (!user_id || !product_id || !movement_type || !quantity) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validación de ENUM para movimientos de inventario
    const validTypes = ['Entrada', 'Salida'];
    if (!validTypes.includes(movement_type)) {
        return res.status(400).json({ message: "Tipo de movimiento no válido (Entrada/Salida)" });
    }

    // Validación numérica 
    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser un número mayor a cero" });
    }

    next();
};