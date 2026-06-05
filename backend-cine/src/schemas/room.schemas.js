import { z } from 'zod';

const roomSchema = z.object({
  room_number: z.number().int({ message: "El número de sala debe ser un entero" }),
  
  total_capacity: z.number()
    .int()
    .positive({ message: "La capacidad debe ser un número positivo" }),
    
  room_type: z.enum(['2D', '3D', 'VIP'], {
    errorMap: () => ({ message: "Tipo de sala inválido (2D, 3D o VIP)" })
  }),
  
  room_status: z.enum(['Disponible', 'Limpieza', 'Ocupada'], {
    errorMap: () => ({ message: "Estado de sala no reconocido" })
  })
});

export default roomSchema;