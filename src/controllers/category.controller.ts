import { Request, Response } from "express";
import Category from "../model/Category";
import asyncHandler from "../utils/asyncHandler";
import Blog from "../model/Blog";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, name, description } = req.body;

    if (!slug || !name || !description) {
      const err: any = new Error("All fields are required");
      err.statusCode = 400;
      throw err;
    }

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      const err: any = new Error("Category already exists");
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.create({ name, slug, description });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  },
);

export const getAllCategory = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await Category.find({});

    if (categories.length === 0) {
      const err: any = new Error("No category found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  },
);

export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  },
);

export const getBlogsByCategorySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const blogs = await Blog.aggregate([
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
  },
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([_, value]) => value !== null && value !== "",
      ),
    );

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  },
);
