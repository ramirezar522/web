import { z } from 'zod';

const genreSchema = z.object({
  name: z.string()
    .min(3, { message: "El nombre del género debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre del género no puede exceder los 100 caracteres" })
});

export default genreSchema;