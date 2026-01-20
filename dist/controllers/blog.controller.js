"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogBySlug = exports.getAllBlogs = exports.createBlog = void 0;
const Blog_1 = __importDefault(require("../model/Blog"));
const View_1 = __importDefault(require("../model/View"));
const createBlog = async (req, res) => {
    const blog = await Blog_1.default.create(req.body);
    res.status(201).json(blog);
};
exports.createBlog = createBlog;
const getAllBlogs = async (req, res) => {
    const blogs = await Blog_1.default.find({ status: "published" })
        .populate("category")
        .sort({ createdAt: -1 });
    res.json(blogs);
};
exports.getAllBlogs = getAllBlogs;
const getBlogBySlug = async (req, res) => {
    const blog = await Blog_1.default.findOne({ slug: req.params.slug }).populate("category");
    if (!blog)
        return res.status(404).json({ message: "Blog not found" });
    blog.views += 1;
    await blog.save();
    await View_1.default.create({
        blog: blog._id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });
    res.json(blog);
};
exports.getBlogBySlug = getBlogBySlug;
const updateBlog = async (req, res) => {
    const blog = await Blog_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.json(blog);
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    await Blog_1.default.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
};
exports.deleteBlog = deleteBlog;
