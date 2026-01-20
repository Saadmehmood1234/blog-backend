import { Request, Response, NextFunction } from "express";
import { CustomError } from "../config/Types";
import User from "../model/BlogAdmin";
import bcrypt from "bcryptjs";
import generateToken from "../config/GenerateToken";
import asyncHandler from "../utils/asyncHandler";
import redisClient from "../config/redis";
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    const err: any = new Error("Missing required fields");
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findOne({ email });
  if (user) {
    const err: any = new Error("User already exists");
    err.statusCode = 400;
    throw err;
  }
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    email,
    name,
    role: "admin",
    password: hashPass,
  });
  await generateToken(newUser._id.toString(), newUser.role, res);
  res.status(201).json({
    success: true,
    message: "User created Successfully",
    data: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err: any = new Error("Missing required fields");
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findOne({ email });
  if (!user) {
    const err: any = new Error("User does not exist");
    err.statusCode = 404;
    throw err;
  }
  const verifyUser = await bcrypt.compare(password, user.password);
  if (!verifyUser) {
    const err: any = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }
  await generateToken(user._id.toString(), user.role, res);
  res.status(200).json({
    success: true,
    message: "Login Successfully!",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const signout = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (user) {
    await redisClient.del(`auth:${user._id}`);
  }
  res
    .cookie("jwt", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      message: "Logout Successfully",
    });
});



