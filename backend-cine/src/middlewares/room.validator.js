export const validateRoom = (req, res, next) => {
    const { room_number, total_capacity, room_type, room_status } = req.body;
    
    // Validar tipos de proyección (ENUM) definidos 
    const validTypes = ['2D', '3D', 'VIP'];
    const validStatus = ['Disponible', 'Limpieza', 'Ocupada'];

    // Validación de presencia de datos
    if (!room_number || !total_capacity || !room_type) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validación de tipos permitidos
    if (!validTypes.includes(room_type)) {
        return res.status(400).json({ message: "Tipo de sala no válido (2D, 3D, VIP)" });
    }

    // Validación de estados permitidos
    if (room_status && !validStatus.includes(room_status)) {
        return res.status(400).json({ message: "Estado de sala no válido" });
    }

    next();
};
