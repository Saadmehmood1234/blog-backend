"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.default = errorMiddleware;
