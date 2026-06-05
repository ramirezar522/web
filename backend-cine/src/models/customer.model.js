import db from '../config/db.js';

const Customer = {
    findAll: async () => {
        // Ordenado alfabéticamente por apellido
        const { rows } = await db.query('SELECT * FROM customers ORDER BY last_name ASC');
        return rows;
    },

    findById: async (id) => {
        const { rows } = await db.query('SELECT * FROM customers WHERE customer_id = $1', [id]);
        return rows[0];
    },

    findByCedula: async (cedula) => {
        const { rows } = await db.query('SELECT * FROM customers WHERE cedula = $1', [cedula]);
        return rows[0];
    },

    create: async (data) => {
        const { first_name, last_name, cedula, phone, email } = data;
        const query = `
            INSERT INTO customers (first_name, last_name, cedula, phone, email)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const values = [first_name, last_name, cedula, phone, email];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    update: async (id, data) => {
        const { first_name, last_name, cedula, phone, email } = data;
        const query = `
            UPDATE customers 
            SET first_name = $1, last_name = $2, cedula = $3, phone = $4, email = $5
            WHERE customer_id = $6 RETURNING *`;
        const values = [first_name, last_name, cedula, phone, email, id];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

export default Customer;