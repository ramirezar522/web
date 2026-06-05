import SeatAssignment from '../models/seat.model.js';

export const assignSeats = async (req, res) => {
    const { seats, booking_id } = req.body; // 'seats' es un array, ej: ["A1", "A2"]
    
    try {
        const assignments = [];
        for (let seat_number of seats) {
            const newAssignment = await SeatAssignment.create(seat_number, booking_id);
            assignments.push(newAssignment);
        }
        res.status(201).json({
            message: "Asientos asignados con éxito",
            data: assignments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSeatsByBooking = async (req, res) => {
    try {
        const seats = await SeatAssignment.findByBookingId(req.params.bookingId);
        res.json(seats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
