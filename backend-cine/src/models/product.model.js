import db from '../config/db.js';

const Product = {
    // Listar todos los productos con el nombre de su categoría 
    findAll: async () => {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p
            JOIN product_categories c ON p.category_id = c.category_id
            ORDER BY p.name ASC`;
        const { rows } = await db.query(query);
        return rows;
    },

    // Buscar un producto específico
    findById: async (id) => {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p
            JOIN product_categories c ON p.category_id = c.category_id
            WHERE p.product_id = $1`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    // Crear producto con valores por defecto 
    create: async (data) => {
        const { name, min_stock, category_id } = data;
        const query = `
            INSERT INTO products (name, current_stock, min_stock, category_id)
            VALUES ($1, 0, $2, $3) RETURNING *`;
        const values = [name, min_stock || 5, category_id];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    // Actualizar datos 
    update: async (id, data) => {
        const { name, min_stock, category_id } = data;
        const query = `
            UPDATE products 
            SET name = $1, min_stock = $2, category_id = $3
            WHERE product_id = $4 RETURNING *`;
        const values = [name, min_stock, category_id, id];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

export default Product;