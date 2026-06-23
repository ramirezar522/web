import Product from '../models/product.model.js';
import db from '../config/db.js';

export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const categoryId = req.query.category_id ? parseInt(req.query.category_id, 10) : null;
        const search = req.query.search;
        
        let queryStr = `
            SELECT p.*, c.name as category_name 
            FROM products p
            JOIN product_categories c ON p.category_id = c.category_id
            WHERE 1=1`;
        
        let countQueryStr = `
            SELECT COUNT(*) 
            FROM products p
            JOIN product_categories c ON p.category_id = c.category_id
            WHERE 1=1`;
            
        const queryParams = [];
        let paramCount = 0;
        
        if (categoryId) {
            paramCount++;
            queryStr += ` AND p.category_id = $${paramCount}`;
            countQueryStr += ` AND p.category_id = $${paramCount}`;
            queryParams.push(categoryId);
        }
        
        if (search) {
            paramCount++;
            queryStr += ` AND p.name ILIKE $${paramCount}`;
            countQueryStr += ` AND p.name ILIKE $${paramCount}`;
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY p.name ASC`;
        
        const countRes = await db.query(countQueryStr, queryParams);
        const total = parseInt(countRes.rows[0].count, 10);
        
        if (page && limit) {
            const offset = (page - 1) * limit;
            paramCount++;
            queryStr += ` LIMIT $${paramCount}`;
            queryParams.push(limit);
            
            paramCount++;
            queryStr += ` OFFSET $${paramCount}`;
            queryParams.push(offset);
        }
        
        const { rows } = await db.query(queryStr, queryParams);
        
        if (page && limit) {
            return res.json({
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        
        res.json(rows);
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

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Product.update(id, req.body);
        if (!updated) return res.status(404).json({ message: "Producto no encontrado" });
        res.json({ message: "Producto actualizado con éxito", data: updated });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ message: "La categoría especificada no existe" });
        }
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.delete(id);
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
