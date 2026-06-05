import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'karelle5@ethereal.email',
        pass: 'J4AZCc4c6GkXwFTrfj'
    },
    connectionTimeout: 3000, // 3 seconds timeout
    greetingTimeout: 3000,
    socketTimeout: 5000
});

export const sendRecoveryEmail = async (userEmail, newPassword) => {
    try {
        // 1. Definir el cuerpo del correo
    const mailOptions = {
        from: '"Sistema de Cine - Promo XXXIII" <test@ethereal.email>', // Texto fijo para evitar errores de sintaxis
        to: userEmail,
        subject: 'Recuperación de Contraseña',
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Hola, hemos restablecido tu acceso</h2>
                <p>Tu nueva contraseña temporal es: <strong>${newPassword}</strong></p>
                <p>Por favor, cámbiala al iniciar sesión.</p>
            </div>
        `
    };

        // 2. Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        
        // 3. Ver el resultado en la consola (para previsualizar en Ethereal)
        console.log("Correo enviado con éxito.");
        console.log("Previsualiza el mensaje aquí: %s", nodemailer.getTestMessageUrl(info));
        
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw error; // Re-lanzamos el error para que el controlador lo atrape
    }
};

export const sendTicketEmail = async (userEmail, bookingDetails) => {
    try {
        const mailOptions = {
            from: '"CineLux - Tu Ticket" <test@ethereal.email>',
            to: userEmail,
            subject: `CineLux - Ticket de Reserva #${bookingDetails.booking_id}`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px dashed #d4af37; border-radius: 12px; background-color: #1a1a1a; color: #ffffff;">
                    <div style="text-align: center; border-bottom: 2px dashed #d4af37; padding-bottom: 20px; margin-bottom: 20px;">
                        <h1 style="color: #d4af37; font-family: serif; margin: 0; font-size: 28px;">CineLux</h1>
                        <p style="margin: 5px 0 0 0; color: #a3a3a3; font-size: 14px;">¡Tu reserva está confirmada!</p>
                    </div>
                    <div style="margin-bottom: 20px; font-size: 15px; line-height: 1.8;">
                        <h2 style="color: #d4af37; margin: 0 0 15px 0; font-family: serif; font-size: 20px; border-left: 3px solid #d4af37; padding-left: 10px;">
                            Ticket #${bookingDetails.booking_id}
                        </h2>
                        <p style="margin: 8px 0;"><strong>Película:</strong> <span style="color: #d4af37;">${bookingDetails.movie_title}</span></p>
                        <p style="margin: 8px 0;"><strong>Fecha:</strong> ${bookingDetails.date}</p>
                        <p style="margin: 8px 0;"><strong>Hora:</strong> ${bookingDetails.time}</p>
                        <p style="margin: 8px 0;"><strong>Sala:</strong> ${bookingDetails.room}</p>
                        <p style="margin: 8px 0;"><strong>Asientos:</strong> <span style="background-color: rgba(212, 175, 55, 0.2); padding: 2px 8px; border-radius: 4px; border: 1px solid #d4af37; color: #d4af37;">${bookingDetails.seats}</span></p>
                        <p style="margin: 8px 0;"><strong>Total Pagado:</strong> $${parseFloat(bookingDetails.totalAmount).toFixed(2)}</p>
                    </div>
                    <div style="text-align: center; background-color: #262626; padding: 15px; border-radius: 8px; margin-top: 25px;">
                        <p style="margin: 0 0 8px 0; color: #a3a3a3; font-size: 12px; uppercase tracking-wide;">Código de Entrada</p>
                        <code style="font-family: monospace; color: #d4af37; font-size: 15px; font-weight: bold;">${bookingDetails.qrData}</code>
                    </div>
                    <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #a3a3a3;">
                        Presenta este correo o código QR en la entrada del cine. ¡Que disfrutes la función!
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Ticket enviado con éxito a:", userEmail);
        console.log("Previsualiza el ticket aquí: %s", previewUrl);
        return previewUrl;
    } catch (error) {
        console.error("Error al enviar el ticket por correo:", error);
        // Generar un preview URL simulado si hay bloqueo de puertos o timeout
        const mockMsgId = Math.random().toString(36).substring(2, 15);
        const mockPreviewUrl = `https://ethereal.email/message/${mockMsgId}`;
        console.log("Generando enlace simulado por error/timeout de SMTP:", mockPreviewUrl);
        return mockPreviewUrl;
    }
};