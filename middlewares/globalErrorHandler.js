const globalErrorHandler = (err, req, res, next) => {
    console.error('Global Error Handler:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

module.exports = globalErrorHandler;