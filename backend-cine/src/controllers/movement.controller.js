import InventoryMovement from '../models/movement.model.js';
import db from '../config/db.js';

export const getAllMovements = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const type = req.query.type;
        const search = req.query.search;
        
        let queryStr = `
            SELECT m.*, u.first_name || ' ' || u.last_name as user_name, p.name as item_name
            FROM inventory_movements m
            JOIN users u ON m.user_id = u.user_id
            JOIN products p ON m.product_id = p.product_id
            WHERE 1=1`;
        
        let countQueryStr = `
            SELECT COUNT(*)
            FROM inventory_movements m
            JOIN users u ON m.user_id = u.user_id
            JOIN products p ON m.product_id = p.product_id
            WHERE 1=1`;
            
        const queryParams = [];
        let paramCount = 0;
        
        if (type && type !== 'todos') {
            paramCount++;
            queryStr += ` AND m.movement_type = $${paramCount}`;
            countQueryStr += ` AND m.movement_type = $${paramCount}`;
            queryParams.push(type);
        }
        
        if (search) {
            paramCount++;
            queryStr += ` AND (p.name ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
            countQueryStr += ` AND (p.name ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY m.created_at DESC`;
        
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
