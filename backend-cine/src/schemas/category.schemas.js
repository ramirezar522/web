import { z } from 'zod';

const categorySchema = z.object({
  name: z.string()
    .min(3, { message: "El nombre de la categoría es muy corto" }) 
    .max(100, { message: "El nombre no puede exceder los 100 caracteres" })
});

export default categorySchema;