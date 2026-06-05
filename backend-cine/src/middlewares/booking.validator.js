export const validateBooking = (req, res, next) => {
    const { customer_id, screening_id, user_id, booking_status } = req.body;

    // Validación de campos obligatorios
    if (!customer_id || !screening_id || !user_id) {
        return res.status(400).json({ 
            message: "Faltan datos: customer_id, screening_id y user_id son obligatorios" 
        });
    }

    // Validación de ENUM para el estado de la reserva
    const validStatus = ['Confirmada', 'Cancelada'];
    if (booking_status && !validStatus.includes(booking_status)) {
        return res.status(400).json({ message: "Estado de reserva no válido" });
    }

    // Si todo está bien, pasamos al controlador
    next();
};
