import { z } from 'zod';

const userSchema = z.object({
  first_name: z.string()
    .min(2, { message: "El nombre es muy corto" })
    .max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
    
  last_name: z.string()
    .min(2, { message: "El apellido es muy corto" })
    .max(100, { message: "El apellido no puede exceder los 100 caracteres" }),
    
  email: z.string()
    .email({ message: "Formato de correo electrónico inválido" })
    .max(100),
    
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(255),
    
  role_id: z.number()
    .int()
    .positive({ message: "El rol es obligatorio" }),
    
  status: z.enum(['Activo', 'Desactivo', 'Bloqueado'], {
    errorMap: () => ({ message: "Estado de usuario no válido" })
  })
});

export default userSchema;