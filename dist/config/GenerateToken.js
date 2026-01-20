"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId, role, res) => {
    const secret = process.env.JWT_SECRET;
    const token = jsonwebtoken_1.default.sign({ userId, role }, secret, {
        expiresIn: "10d",
    });
    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 10 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    return token;
};
exports.default = generateToken;
