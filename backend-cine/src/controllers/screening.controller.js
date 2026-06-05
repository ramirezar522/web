import Screening from '../models/screening.model.js';

export const getAllScreenings = async (req, res) => {
    try {
        const screenings = await Screening.findAll();
        res.json(screenings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createScreening = async (req, res) => {
    try {
        const newScreening = await Screening.create(req.body);
        res.status(201).json(newScreening);
    } catch (error) {
        // Error de llave foránea (si la película o sala no existen en la DB)
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "Error de integridad: La película o la sala no existen" 
            });
        }
        res.status(500).json({ error: error.message });
    }
};

export const deleteScreening = async (req, res) => {
    try {
        await Screening.delete(req.params.id);
        res.json({ message: "Función eliminada correctamente" });
    } catch (error) {
        // Protección: no borrar funciones que ya tienen gente con boletos comprados
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar: existen reservas asociadas a esta función" 
            });
        }
        res.status(500).json({ error: error.message });
    }
};
