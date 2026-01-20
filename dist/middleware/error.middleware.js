"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleError = async (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};
exports.default = handleError;
