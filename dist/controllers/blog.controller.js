"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogBySlug = exports.getAllBlogs = exports.createBlog = void 0;
const Blog_1 = __importDefault(require("../model/Blog"));
const View_1 = __importDefault(require("../model/View"));
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const redis_1 = __importDefault(require("../config/redis"));
const FilterQuery_1 = require("../utils/FilterQuery");
const Upload_1 = require("../utils/cloudanary/Upload");
// cloudinary.config({
//   cloud_name: 'my_cloud_name',
//   api_key: 'my_key',
//   api_secret: 'my_secret'
// });
exports.createBlog = (0, asyncHandler_1.default)(async (req, res) => {
    let imageUrl = "";
    if (req.file) {
        const uploadResult = await (0, Upload_1.uploadImageToCloudinary)(req.file);
        imageUrl = uploadResult.secure_url;
    }
    const tags = req.body.tags
        ? req.body.tags.split(",").map((t) => t.trim())
        : [];
    const readTime = Number(req.body.readTime) || 1;
    const categoryId = req.body.category;
    if (!req.body.title ||
        !req.body.content ||
        !req.body.excerpt ||
        !categoryId ||
        !req.body.seoTitle ||
        !req.body.seoDescription ||
        !req.body.slug) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const blog = await Blog_1.default.create({
        title: req.body.title,
        content: req.body.content,
        excerpt: req.body.excerpt,
        category: categoryId,
        seoTitle: req.body.seoTitle,
        seoDescription: req.body.seoDescription,
        slug: req.body.slug,
        tags,
        readTime,
        featuredImage: imageUrl,
    });
    console.log(blog);
    // await redisClient.del("blogs:all");
    res.status(201).json({
        success: true,
        message: "Blog created Successfully!",
        data: blog,
    });
});
exports.getAllBlogs = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, title, category, isFeatured, tags, search, readTime, createdAt, } = req.query;
    const filterValue = {
        title,
        category,
        isFeatured,
        search,
        tags,
        readTime,
        createdAt,
    };
    const limit = 10;
    const skip = (Number(page) - 1) * limit;
    const cacheKey = "blogs:all";
    console.log("Test", search, limit);
    // const cachedBlogs = await redisClient.get(cacheKey);
    // if (cachedBlogs) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Fetched Blog Successfully!",
    //     source: "redis",
    //     count: JSON.parse(cachedBlogs).length,
    //     data: JSON.parse(cachedBlogs),
    //   });
    // }
    const filterData = (0, FilterQuery_1.filterQuery)(filterValue);
    Object.keys(filterData).forEach((key) => {
        if (filterData[key] === "" ||
            filterData[key] === undefined ||
            (Array.isArray(filterData[key]) && filterData[key].length === 0)) {
            delete filterData[key];
        }
    });
    const blogs = await Blog_1.default.find({ ...filterData, isDeleted: false })
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(10);
    // .limit(limit)
    // .skip(skip);
    // if (blogs.length === 0) {
    //   const error: any = new Error("No blogs found");
    //   error.statusCode = 404;
    //   throw error;
    // }
    console.log(blogs);
    await redis_1.default.set(cacheKey, JSON.stringify(blogs), { EX: 5 * 60 });
    res.status(200).json({
        success: true,
        message: "Fetched Blog Successfully!",
        count: blogs.length,
        data: blogs,
    });
});
exports.getBlogBySlug = (0, asyncHandler_1.default)(async (req, res) => {
    const slug = req?.params?.slug;
    if (!slug) {
        const error = new Error("Slug is missing");
        error.statusCode = 404;
        throw error;
    }
    // const cacheKey = `blog:${slug}`;
    // const cachedBlog = await redisClient.get(cacheKey);
    // if (cachedBlog) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Fetched Blog Successfully!",
    //     source: "redis",
    //     data: JSON.parse(cachedBlog),
    //   });
    // }
    const blog = await Blog_1.default.findOne({ slug }).populate("category");
    if (!blog) {
        const error = new Error("No blogs found");
        error.statusCode = 404;
        throw error;
    }
    blog.views += 1;
    await blog.save();
    await View_1.default.create({
        blog: blog._id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });
    // await redisClient.set(cacheKey, JSON.stringify(blog), { EX: 5*60 });
    res.status(200).json({
        success: true,
        message: "Fetched Blog Successfully!",
        data: blog,
    });
});
exports.updateBlog = (0, asyncHandler_1.default)(async (req, res) => {
    const updateData = Object.fromEntries(Object.entries(req.body).filter(([_, value]) => value !== null && value !== ""));
    const blog = await Blog_1.default.findByIdAndUpdate(req.params.id, {
        $set: updateData,
    }, {
        new: true,
        runValidators: true,
    });
    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }
    // await redisClient.del("blogs:all");
    // await redisClient.del(`blog:${blog.slug}`);
    // res.status(200).json({
    //   success: true,
    //   message: "Blog Updated Successfully!",
    //   data: blog,
    // });
});
exports.deleteBlog = (0, asyncHandler_1.default)(async (req, res) => {
    const id = String(req.params.id);
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog id",
        });
    }
    const blog = await Blog_1.default.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, { $set: { isDeleted: true } }, { new: true });
    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found or already deleted",
        });
    }
    // await Promise.all([
    //   redisClient.del("blogs:all"),
    //   redisClient.del(`blog:${blog.slug}`),
    // ]);
    res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
    });
});
