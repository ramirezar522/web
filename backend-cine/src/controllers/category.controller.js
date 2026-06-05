import ProductCategory from '../models/category.model.js';

export const getAllCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const newCategory = await ProductCategory.create(req.body.name);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una categoría
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await query('UPDATE categories SET name = $1 WHERE id = $2', [name, id]);
        if (result.rowCount === 0) return res.status(404).json({ message: "Categoría no encontrada" });
        res.json({ message: "Categoría actualizada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la categoría" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await ProductCategory.delete(req.params.id);
        res.json({ message: "Categoría eliminada con éxito" });
    } catch (error) {
        // Manejo de integridad referencial: No borrar categorías con productos activos
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar: hay productos registrados en esta categoría" 
            });
        }
        res.status(500).json({ error: error.message });
    }
};
