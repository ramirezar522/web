import userSchema from '../schemas/user.schema.js';

export const validateUser = (req, res, next) => {
    try {
        // 1. Validamos el body con el esquema de Zod
        userSchema.parse(req.body);
        
        // 2. Si pasa la validación, saltamos al controlador
        return next(); 
    } catch (error) {
        // 3. Si Zod detecta errores, respondemos aquí mismo
        if (error.errors) {
            return res.status(400).json({
                success: false,
                errors: error.errors.map(err => err.message)
            });
        }
        
        // 4. Cualquier otro error inesperado
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};