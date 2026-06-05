export const validateCustomer = (req, res, next) => {
    const { first_name, last_name, cedula, email } = req.body;

    // Validación de presencia de campos críticos
    if (!first_name || !last_name || !cedula || !email) {
        return res.status(400).json({ 
            message: "Nombre, apellido, cédula y email son campos obligatorios" 
        });
    }

    // Validación de formato de email (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El formato del email no es válido" });
    }

    // Si todo es correcto, permitimos el paso al controlador
    next();
};
