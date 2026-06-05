export const validateScreening = (req, res, next) => {
    const { date_time, movie_id, room_id } = req.body;

    // Validación de campos obligatorios para la cartelera
    if (!date_time || !movie_id || !room_id) {
        return res.status(400).json({ 
            message: "La fecha/hora, el ID de película y el ID de sala son obligatorios" 
        });
    }

    // Validación cronológica
    const screeningDate = new Date(date_time);
    if (isNaN(screeningDate.getTime()) || screeningDate < new Date()) {
        return res.status(400).json({ 
            message: "La fecha debe ser válida y posterior a la actual" 
        });
    }

    // Todo correcto, permitimos el registro de la función
    next();
};
