export const validateSeat = (req, res, next) => {
    const { seat_number, booking_id } = req.body;

    // Validación de campos obligatorios
    if (!seat_number || !booking_id) {
        return res.status(400).json({ 
            message: "El número de asiento y el ID de reserva son obligatorios" 
        });
    }

    // Validación de formato de asiento 
    const seatRegex = /^[A-Z]\d{1,2}$/;
    if (!seatRegex.test(seat_number)) {
        return res.status(400).json({ 
            message: "Formato de asiento inválido (Ejemplo correcto: A1, B10)" 
        });
    }

    // Si el formato es correcto, permitimos la asignación
    next();
};
