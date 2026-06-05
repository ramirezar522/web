import { z } from 'zod';

const seatAssignmentSchema = z.object({
  seat_number: z.string()
    .min(1, { message: "El número de asiento es obligatorio" })
    .max(10, { message: "El formato del asiento es demasiado largo" }),
    
  booking_id: z.number().int({ message: "ID de reserva inválido" })
});

export default seatAssignmentSchema;