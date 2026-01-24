"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
// router.post("/", protect,validationMiddleware(createBlogsSchema), createBlog);
router.post("/", upload.single("image"), blog_controller_1.createBlog);
router.get("/", blog_controller_1.getAllBlogs);
router.get("/:slug", blog_controller_1.getBlogBySlug);
router.put("/:id", auth_middleware_1.protect, blog_controller_1.updateBlog);
router.delete("/:id", auth_middleware_1.protect, blog_controller_1.deleteBlog);
exports.default = router;
