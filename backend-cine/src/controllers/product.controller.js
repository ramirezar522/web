import Product from '../models/product.model.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        // Manejo de error de clave foránea (categoría no existe)
        if (error.code === '23503') {
            return res.status(400).json({ message: "La categoría especificada no existe" });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getInventoryAlerts = async (req, res) => {
    try {
        // Buscamos productos que están por debajo o igual al stock mínimo
        const products = await Product.findAll();
        const alerts = products.filter(p => p.current_stock <= p.min_stock);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
