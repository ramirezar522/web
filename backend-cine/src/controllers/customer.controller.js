import Customer from '../models/customer.model.js';
import db from '../config/db.js';

export const getAllCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);
        const search = req.query.search;
        
        let queryStr = `SELECT * FROM customers WHERE 1=1`;
        let countQueryStr = `SELECT COUNT(*) FROM customers WHERE 1=1`;
        
        const queryParams = [];
        let paramCount = 0;
        
        if (search) {
            paramCount++;
            queryStr += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR cedula ILIKE $${paramCount})`;
            countQueryStr += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR cedula ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY last_name ASC`;
        
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

export const getCustomerByCedula = async (req, res) => {
    try {
        const customer = await Customer.findByCedula(req.params.cedula);
        if (!customer) return res.status(404).json({ message: "Cliente no encontrado" });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const newCustomer = await Customer.create(req.body);
        res.status(201).json(newCustomer);
    } catch (error) {
        // Manejo de error si la cédula ya existe 
        if (error.code === '23505') {
            return res.status(400).json({ message: "Ya existe un cliente con esa cédula" });
        }
        res.status(500).json({ error: error.message });
    }
};

// Actualizar datos del cliente
export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Customer.update(id, req.body);
        if (!updated) return res.status(404).json({ message: "Cliente no encontrado" });
        res.json({ message: "Cliente actualizado con éxito", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar cliente: " + error.message });
    }
};

// Eliminar cliente
export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        await Customer.delete(id);
        res.json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar cliente: " + error.message });
    }
};