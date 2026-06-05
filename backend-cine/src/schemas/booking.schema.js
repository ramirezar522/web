import { z } from 'zod';

const bookingSchema = z.object({
  customer_id: z.number().int({ message: "El ID del cliente debe ser un número entero" }),
  booking_status: z.enum(['Confirmada', 'Cancelada']).default('Confirmada'),
  screening_id: z.number().int({ message: "El ID de la función es obligatorio" }),
  user_id: z.number().int({ message: "El ID del usuario/empleado es obligatorio" })
});

export default bookingSchema;