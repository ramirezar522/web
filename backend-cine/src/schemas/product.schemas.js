import { z } from 'zod';

const productSchema = z.object({
  name: z.string()
    .min(1, { message: "El nombre del producto es obligatorio" })
    .max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
    
  min_stock: z.number()
    .int({ message: "El stock mínimo debe ser un número entero" })
    .nonnegative({ message: "El stock mínimo no puede ser negativo" }),
    
  category_id: z.number()
    .int({ message: "ID de categoría inválido" })
});

export default productSchema;