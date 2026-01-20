"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = __importStar(require("../config/redis"));
// import Redis from "ioredis";
// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,
// });
(async () => {
    try {
        await (0, redis_1.connectRedis)();
        console.log("Redis connected successfully for rate limiter");
    }
    catch (err) {
        console.error("Redis connection failed:", err);
    }
})();
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: new rate_limit_redis_1.default({
        sendCommand: (...args) => {
            return redis_1.default.sendCommand(args);
        },
    }),
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
});
// import { Request, Response, NextFunction } from "express";
// import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import Redis from "ioredis";
// // Initialize Redis client
// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,
// });
// // Configure rate limiter
// export const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
//   legacyHeaders: false, // Disable `X-RateLimit-*` headers
//   store: new RedisStore({
//     sendCommand: (...args: string[]) => redisClient.call(args),
//   }),
//   message: {
//     success: false,
//     message: "Too many requests from this IP, please try again later.",
//   },
// });
