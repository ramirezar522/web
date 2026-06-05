import Customer from '../models/customer.model.js';

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
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
    const { first_name, last_name, email } = req.body;
    try {
        const result = await query(
            'UPDATE customers SET first_name = $1, last_name = $2, email = $3 WHERE id = $4',
            [first_name, last_name, email, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: "Cliente no encontrado" });
        res.json({ message: "Cliente actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar cliente" });
    }
};