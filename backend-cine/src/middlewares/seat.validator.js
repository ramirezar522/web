export const validateSeat = (req, res, next) => {
    const { seat_number, seats, booking_id } = req.body;

    // Validación de campos obligatorios
    if (!booking_id) {
        return res.status(400).json({ 
            message: "El ID de reserva es obligatorio" 
        });
    }

    const seatRegex = /^[A-Z]\d{1,2}$/;

    if (seats) {
        if (!Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({
                message: "El campo 'seats' debe ser un arreglo de asientos no vacío"
            });
        }
        for (let s of seats) {
            if (!seatRegex.test(s)) {
                return res.status(400).json({ 
                    message: `Formato de asiento inválido: ${s} (Ejemplo correcto: A1, B10)` 
                });
            }
        }
    } else if (seat_number) {
        if (!seatRegex.test(seat_number)) {
            return res.status(400).json({ 
                message: `Formato de asiento inválido: ${seat_number} (Ejemplo correcto: A1, B10)` 
            });
        }
    } else {
        return res.status(400).json({ 
            message: "El número de asiento (o arreglo de asientos) es obligatorio" 
        });
    }

    // Si el formato es correcto, permitimos la asignación
    next();
};
