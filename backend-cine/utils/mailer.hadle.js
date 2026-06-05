import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'karelle5@ethereal.email',
        pass: 'J4AZCc4c6GkXwFTrfj'
    }
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