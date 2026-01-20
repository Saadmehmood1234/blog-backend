"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getBlogsByCategorySlug = exports.getCategoryBySlug = exports.getAllCategory = exports.createCategory = void 0;
const Category_1 = __importDefault(require("../model/Category"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const Blog_1 = __importDefault(require("../model/Blog"));
exports.createCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const { slug, name, description } = req.body;
    if (!slug || !name || !description) {
        const err = new Error("All fields are required");
        err.statusCode = 400;
        throw err;
    }
    const existingCategory = await Category_1.default.findOne({ slug });
    if (existingCategory) {
        const err = new Error("Category already exists");
        err.statusCode = 400;
        throw err;
    }
    const category = await Category_1.default.create({ name, slug, description });
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
    });
});
exports.getAllCategory = (0, asyncHandler_1.default)(async (_req, res) => {
    const categories = await Category_1.default.find({});
    if (categories.length === 0) {
        const err = new Error("No category found");
        err.statusCode = 404;
        throw err;
    }
    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
    });
});
exports.getCategoryBySlug = (0, asyncHandler_1.default)(async (req, res) => {
    const category = await Category_1.default.findOne({ slug: req.params.slug });
    if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        throw err;
    }
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.getBlogsByCategorySlug = (0, asyncHandler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const blogs = await Blog_1.default.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: "$category",
        },
        {
            $match: {
                "category.slug": slug,
            },
        },
    ]);
    if (!blogs.length) {
        return res.status(404).json({
            success: false,
            message: "No blogs found for this category",
        });
    }
    res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs,
    });
});
exports.getCategoryById = (0, asyncHandler_1.default)(async (req, res) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        throw err;
    }
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.updateCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const updateData = Object.fromEntries(Object.entries(req.body).filter(([_, value]) => value !== null && value !== ""));
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        throw err;
    }
    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
    });
});
exports.deleteCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const category = await Category_1.default.findByIdAndDelete(req.params.id);
    if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        throw err;
    }
    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});
