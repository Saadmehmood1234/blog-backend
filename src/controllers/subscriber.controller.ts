import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import BlogSubscriber from "../model/Subscribe";
import { generateVerificationToken } from "../utils/generateVerificationToken";
import { renderTemplate } from "../utils/renderTemplate";
import { sendEmail } from "../utils/services/emailService";
import crypto from "crypto";

export const createSubscriber = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingSubscriber = await BlogSubscriber.findOne({
      email: normalizedEmail,
    });
    if (existingSubscriber?.isVerified) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed",
      });
    }

    const { rawToken, hashedToken } = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    if (existingSubscriber) {
      existingSubscriber.verificationToken = hashedToken;
      existingSubscriber.verificationTokenExpiresAt =
        verificationTokenExpiresAt;

      await existingSubscriber.save();
      const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${rawToken}`;
      const html = renderTemplate("verify-email.html", {
        VERIFY_URL: verifyUrl,
      });

      await sendEmail({
        to: normalizedEmail,
        subject: "Verify your email subscription",
        html,
      });
      console;
      return res.status(200).json({
        success: true,
        message: "Verification email resent. Please check your inbox.",
      });
    }

    await BlogSubscriber.create({
      email: normalizedEmail,
      verificationToken: hashedToken,
      verificationTokenExpiresAt,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${rawToken}`;
    const html = renderTemplate("verify-email.html", {
      VERIFY_URL: verifyUrl,
    });
    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email subscription",
      html,
    });

    res.status(201).json({
      success: true,
      message: "Thanks for subscribing! Please verify your email.",
    });
  },
);

export const getSubscriber = asyncHandler(
  async (req: Request, res: Response) => {
    const subscribers = await BlogSubscriber.find({})
      .select("email isVerified createdAt")
      .lean();

    res.status(200).json({
      success: true,
      message: "Fetched subscribers successfully",
      data: subscribers,
    });
  },
);

export const verifySubscriber = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Token missing or invalid" });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const subscriber = await BlogSubscriber.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiresAt: { $gt: new Date() },
    });
    console.log(token, subscriber);
    if (!subscriber) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    subscriber.verificationTokenExpiresAt = undefined;

    await subscriber.save();

    return res.status(200).json({ success: true, message: "Email verified!" });
  },
);
