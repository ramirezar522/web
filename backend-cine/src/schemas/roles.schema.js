import { z } from 'zod';

const roleSchema = z.object({
  role_name: z.enum(['Gerente', 'Empleado'], {
    errorMap: () => ({ message: "El rol debe ser estrictamente 'Gerente' o 'Empleado'" })
  })
});

export default roleSchema;