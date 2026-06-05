import { z } from 'zod';

const screeningSchema = z.object({
  // ✅ Coerce transforma el string de fecha del frontend a objeto Date
  date_time: z.coerce.date({
    errorMap: () => ({ message: "Formato de fecha y hora inválido" })
  }),
  
  movie_id: z.number().int({ message: "ID de película inválido" }),
  
  room_id: z.number().int({ message: "ID de sala inválido" })
});

export default screeningSchema;