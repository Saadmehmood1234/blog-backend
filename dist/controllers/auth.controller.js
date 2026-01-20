"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signout = exports.signin = exports.signup = void 0;
const BlogAdmin_1 = __importDefault(require("../model/BlogAdmin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const GenerateToken_1 = __importDefault(require("../config/GenerateToken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const redis_1 = __importDefault(require("../config/redis"));
exports.signup = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        const err = new Error("Missing required fields");
        err.statusCode = 400;
        throw err;
    }
    const user = await BlogAdmin_1.default.findOne({ email });
    if (user) {
        const err = new Error("User already exists");
        err.statusCode = 400;
        throw err;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashPass = await bcryptjs_1.default.hash(password, salt);
    const newUser = await BlogAdmin_1.default.create({
        email,
        name,
        role: "admin",
        password: hashPass,
    });
    await (0, GenerateToken_1.default)(newUser._id.toString(), newUser.role, res);
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
exports.signin = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        const err = new Error("Missing required fields");
        err.statusCode = 400;
        throw err;
    }
    const user = await BlogAdmin_1.default.findOne({ email });
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
