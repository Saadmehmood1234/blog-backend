import { Response } from "express";
import jwt from "jsonwebtoken";
import redisClient from "./redis";
const generateToken = async (userId: string, role: string, res: Response) => {
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign({ userId, role }, secret, {
    expiresIn: "10d",
  });
  await redisClient.set(`auth:${userId}`, token, {
    EX: 10 * 24 * 60 * 60 * 1000,
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

export default generateToken;
