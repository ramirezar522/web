import db from '../config/db.js';

const ProductCategory = {
    findAll: async () => {
        const query = 'SELECT * FROM product_categories ORDER BY name ASC';
        const { rows } = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM product_categories WHERE category_id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    create: async (name) => {
        const query = 'INSERT INTO product_categories (name) VALUES ($1) RETURNING *';
        const { rows } = await db.query(query, [name]);
        return rows[0];
    },

    update: async (id, name) => {
        const query = 'UPDATE product_categories SET name = $1 WHERE category_id = $2 RETURNING *';
        const { rows } = await db.query(query, [name, id]);
        return rows[0];
    },

    delete: async (id) => {
        // SQL lanzará error si hay productos asociados a esta categoría (integridad referencial)
        const query = 'DELETE FROM product_categories WHERE category_id = $1';
        await db.query(query, [id]);
        return true;
    }
};

export default ProductCategory;