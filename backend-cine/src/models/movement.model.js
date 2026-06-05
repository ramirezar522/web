import db from '../config/db.js';

const InventoryMovement = {
    // Listar historial de movimientos con detalles de producto y responsable
    findAll: async () => {
        const query = `
            SELECT m.*, p.name as product_name, u.first_name as user_name
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.product_id
            JOIN users u ON m.user_id = u.user_id
            ORDER BY m.created_at DESC`;
        const { rows } = await db.query(query);
        return rows;
    },

    // Registrar un nuevo movimiento (Entrada/Salida)
    create: async (data) => {
        const { user_id, product_id, movement_type, quantity } = data;
        const query = `
            INSERT INTO inventory_movements (user_id, product_id, movement_type, quantity)
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [user_id, product_id, movement_type, quantity];
        
        /* 🚀 Nota de Ingeniería: Al ejecutar este INSERT, el Trigger que 
           programamos en PostgreSQL actualizará automáticamente la tabla 'products'.
        */
        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

export default InventoryMovement;