export const successResponse = (res, message, data = {}, statusCode = 200, pagination = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(pagination && { pagination })
    });
};

// manejo de errores
export const errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};