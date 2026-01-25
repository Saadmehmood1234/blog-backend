import { Request, Response, NextFunction } from "express";
import { CustomError } from "../config/Types";
import User from "../model/BlogAdmin";
import bcrypt from "bcryptjs";
import generateToken from "../config/GenerateToken";
import asyncHandler from "../utils/asyncHandler";
import redisClient from "../config/redis";
import { generateVerificationToken } from "../utils/generateVerificationToken";
import { renderTemplate } from "../utils/renderTemplate";
import { sendEmail } from "../utils/services/emailService";
import crypto from "crypto";
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    const err: any = new Error("Missing required fields");
    err.statusCode = 400;
    throw err;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (user) {
    const err: any = new Error("User already exists");
    err.statusCode = 400;
    throw err;
  }
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(password, salt);

  const { rawToken, hashedToken } = generateVerificationToken();
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const verifyUrl = `${process.env.FRONTEND_URL}/verify/user?token=${rawToken}`;
  const html = renderTemplate("verify-email.html", {
    VERIFY_URL: verifyUrl,
  });
  const newUser = await User.create({
    email: normalizedEmail,
    name,
    role: "admin",
    password: hashPass,
    verificationTokenExpiresAt,
    verificationToken: hashedToken,
  });
  await sendEmail({
    to: normalizedEmail,
    subject: "Verify your email subscription",
    html,
  });
  // await generateToken(newUser._id.toString(), newUser.role, res);
  // res.status(201).json({
  //   success: true,
  //   message: "User created Successfully",
  //   data: {
  //     id: newUser._id,
  //     name: newUser.name,
  //     email: newUser.email,
  //     role: newUser.role,
  //   },
  // });
  res.status(200).json({
    success: true,
    message: "We have sent an Email. Please verify your email!",
  });
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err: any = new Error("Missing required fields");
    err.statusCode = 400;
    throw err;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
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
  if (!user.isVerified) {
    const { rawToken, hashedToken } = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    user.verificationToken = hashedToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;

    await user.save();
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/user?token=${rawToken}`;
    const html = renderTemplate("verify-email.html", {
      VERIFY_URL: verifyUrl,
    });

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email",
      html,
    });
    return res.status(200).json({
      success: true,
      message: "Verification email resent. Please check your inbox.",
    });
  }
  await generateToken(user._id.toString(), user.role, res);
  res.status(200).json({
    success: true,
    message: "Login Successfully!",
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

export const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Token missing or invalid" });
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;

  await user.save();
  await generateToken(user._id.toString(), user.role, res);
  res.status(201).json({
    success: true,
    message: "User created Successfully",
  });
});

