"use strict";
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import User from "../model/User";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BlogAdmin_1 = __importDefault(require("../model/BlogAdmin"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.protect = (0, asyncHandler_1.default)(async (req, _res, next) => {
    let token;
    if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }
    else if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        const err = new Error("Not authorized, token missing");
        err.statusCode = 401;
        throw err;
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // const redisToken = await redisClient.get(`auth:${decoded.userId}`);
    // if (!redisToken) {
    //   const err: any = new Error("Session expired");
    //   err.statusCode = 401;
    //   throw err;
    // }
    const user = await BlogAdmin_1.default.findById(decoded.userId).select("-password");
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 401;
        throw err;
    }
    req.user = user;
    next();
});
