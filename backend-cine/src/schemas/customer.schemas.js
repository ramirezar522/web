import { z } from 'zod';

const customerSchema = z.object({
  first_name: z.string()
    .min(2, { message: "El nombre es muy corto" })
    .max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
  
  last_name: z.string()
    .min(2, { message: "El apellido es muy corto" })
    .max(100, { message: "El apellido no puede exceder los 100 caracteres" }),
  
  cedula: z.string()
    .min(5, { message: "Cédula inválida" })
    .max(20, { message: "La cédula es demasiado larga" }),
  
  phone: z.string()
    .max(20, { message: "El teléfono no puede exceder los 20 caracteres" })
    .optional(),
  
  email: z.string()
    .email({ message: "Formato de correo electrónico inválido" })
    .max(100)
    .optional()
});

export default customerSchema;