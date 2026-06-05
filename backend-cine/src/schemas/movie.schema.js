import { z } from 'zod';

const movieSchema = z.object({
  title: z.string()
    .min(1, { message: "El título es obligatorio" })
    .max(255, { message: "El título no puede exceder los 255 caracteres" }),
    
  director: z.string()
    .max(100, { message: "El nombre del director es demasiado largo" }),
    
  duration: z.string()
    .max(50, { message: "La duración debe ser un texto corto (ej: 120 min)" }),
    
  poster_url: z.string()
    .url({ message: "Debe ser una URL válida para la imagen" })
    .max(255),
    
  status: z.enum(['Activa', 'Desactiva'], {
    errorMap: () => ({ message: "El estado debe ser 'Activa' o 'Desactiva'" })
  }),
  
  genre_id: z.number().int({ message: "ID de género inválido" })
});

export default movieSchema;