// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import User from "../model/User";

// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.cookies?.jwt;
//   if (!token) return next({ statusCode: 401, message: "Not authorized" });
//   try {
//     const decode = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       userId: string;
//       role: string;
//     };
//     if (!decode) {
//       return next({
//         statusCode: 401,
//         message: "Invalid Token",
//       });
//     }
//     const user = await User.findById(decode.userId).select("-password");
//     if (!user) {
//       return next({ statusCode: 401, message: "User not found" });
//     }
//     (req as any).user = user;
//     next();
//   } catch (error: any) {
//     return next({
//       statusCode: 500,
//       message: error.message || "Error in auth middleware",
//     });
//   }
// };

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../model/BlogAdmin";
import asyncHandler from "../utils/asyncHandler";
import redisClient from "../config/redis";

interface JwtPayload {
  userId: string;
  role: string;
}

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;
   
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
console.log(token,"Token")
    if (!token) {
      const err: any = new Error("Not authorized, token missing");
      err.statusCode = 401;
      throw err;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // const redisToken = await redisClient.get(`auth:${decoded.userId}`);
    // if (!redisToken) {
    //   const err: any = new Error("Session expired");
    //   err.statusCode = 401;
    //   throw err;
    // }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }

    (req as any).user = user;

    next();
  }
);
