"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.signout = exports.signin = exports.signup = void 0;
const BlogAdmin_1 = __importDefault(require("../model/BlogAdmin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const GenerateToken_1 = __importDefault(require("../config/GenerateToken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const redis_1 = __importDefault(require("../config/redis"));
const generateVerificationToken_1 = require("../utils/generateVerificationToken");
const renderTemplate_1 = require("../utils/renderTemplate");
const emailService_1 = require("../utils/services/emailService");
const crypto_1 = __importDefault(require("crypto"));
exports.signup = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        const err = new Error("Missing required fields");
        err.statusCode = 400;
        throw err;
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await BlogAdmin_1.default.findOne({ email: normalizedEmail });
    if (user) {
        const err = new Error("User already exists");
        err.statusCode = 400;
        throw err;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashPass = await bcryptjs_1.default.hash(password, salt);
    const { rawToken, hashedToken } = (0, generateVerificationToken_1.generateVerificationToken)();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/user?token=${rawToken}`;
    const html = (0, renderTemplate_1.renderTemplate)("verify-email.html", {
        VERIFY_URL: verifyUrl,
    });
    const newUser = await BlogAdmin_1.default.create({
        email: normalizedEmail,
        name,
        role: "admin",
        password: hashPass,
        verificationTokenExpiresAt,
        verificationToken: hashedToken,
    });
    await (0, emailService_1.sendEmail)({
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
exports.signin = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        const err = new Error("Missing required fields");
        err.statusCode = 400;
        throw err;
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await BlogAdmin_1.default.findOne({ email: normalizedEmail });
    if (!user) {
        const err = new Error("User does not exist");
        err.statusCode = 404;
        throw err;
    }
    const verifyUser = await bcryptjs_1.default.compare(password, user.password);
    if (!verifyUser) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }
    if (!user.isVerified) {
        const { rawToken, hashedToken } = (0, generateVerificationToken_1.generateVerificationToken)();
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.verificationToken = hashedToken;
        user.verificationTokenExpiresAt = verificationTokenExpiresAt;
        await user.save();
        const verifyUrl = `${process.env.FRONTEND_URL}/verify/user?token=${rawToken}`;
        const html = (0, renderTemplate_1.renderTemplate)("verify-email.html", {
            VERIFY_URL: verifyUrl,
        });
        await (0, emailService_1.sendEmail)({
            to: normalizedEmail,
            subject: "Verify your email",
            html,
        });
        return res.status(200).json({
            success: true,
            message: "Verification email resent. Please check your inbox.",
        });
    }
    await (0, GenerateToken_1.default)(user._id.toString(), user.role, res);
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
exports.signout = (0, asyncHandler_1.default)(async (req, res) => {
    const user = req.user;
    if (user) {
        await redis_1.default.del(`auth:${user._id}`);
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
exports.verifyUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return res
            .status(400)
            .json({ success: false, message: "Token missing or invalid" });
    }
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = await BlogAdmin_1.default.findOne({
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
    await (0, GenerateToken_1.default)(user._id.toString(), user.role, res);
    res.status(201).json({
        success: true,
        message: "User created Successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
