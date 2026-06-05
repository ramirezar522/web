import InventoryMovement from '../models/movement.model.js';

export const getAllMovements = async (req, res) => {
    try {
        const movements = await InventoryMovement.findAll();
        res.json(movements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createMovement = async (req, res) => {
    try {
        const newMovement = await InventoryMovement.create(req.body);
        res.status(201).json({
            message: "Movimiento registrado. El stock ha sido actualizado automáticamente.",
            data: newMovement
        });
    } catch (error) {
        // Manejo de integridad referencial (FK)
        if (error.code === '23503') {
            return res.status(400).json({ message: "El producto o usuario no existe" });
        }
        res.status(500).json({ error: error.message });
    }
};
