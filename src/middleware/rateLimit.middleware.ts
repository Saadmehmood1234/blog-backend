import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient, { connectRedis } from "../config/redis";
// import Redis from "ioredis";

// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,
// });
(async () => {
  try {
    await connectRedis();
    console.log("Redis connected successfully for rate limiter");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();
export const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => {
      return redisClient.sendCommand(args as any) as Promise<any>;
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
