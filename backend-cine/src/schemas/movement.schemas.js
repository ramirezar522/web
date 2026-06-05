import { z } from 'zod';

const movementSchema = z.object({
  user_id: z.number().int({ message: "ID de usuario inválido" }),
  product_id: z.number().int({ message: "ID de producto inválido" }),
  movement_type: z.enum(['Entrada', 'Salida'], { 
    errorMap: () => ({ message: "El tipo de movimiento debe ser 'Entrada' o 'Salida'" }) 
  }),
  quantity: z.number()
    .int()
    .positive({ message: "La cantidad debe ser un número entero mayor a cero" })
});

export default movementSchema;