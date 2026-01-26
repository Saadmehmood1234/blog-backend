import { Request, Response } from "express";
import Category from "../model/Category";
import asyncHandler from "../utils/asyncHandler";
import Blog from "../model/Blog";
import redisClient from "../config/redis";

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

    await redisClient.del("category:all");
    await redisClient.del(`category:${slug}`);
    await redisClient.del(`category:blogs:${slug}`);
    await redisClient.del("dashboard:stats");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  },
);

export const getAllCategory = asyncHandler(
  async (_req: Request, res: Response) => {
    const cacheKey = `category:all`;
    const cachedCategory = await redisClient.get(cacheKey);
    if (cachedCategory) {
      return res.status(200).json({
        success: true,
        message: "Fetched Category Successfully!",
        source: "redis",
        data: JSON.parse(cachedCategory),
      });
    }
    const categories = await Category.find({});

    await redisClient.set(cacheKey, JSON.stringify(categories), {
      EX: 10*60,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  },
);

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const cacheKey = `category:${req.params.slug}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        source: "redis",
        data: JSON.parse(cached),
      });
    }
  } catch (err) {
    console.error("Redis error:", err);
  }

  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    throw Object.assign(new Error("Category not found"), { statusCode: 404 });
  }

  await redisClient.set(cacheKey, JSON.stringify(category), {
    EX: 60 * 10,
  });

  res.json({ success: true, data: category });
});

export const getBlogsByCategorySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const cacheKey = `category:blogs:${slug}`;

    const cachedBlogs = await redisClient.get(cacheKey);
    if (cachedBlogs) {
      return res.status(200).json({
        success: true,
        message: "Fetched Blogs Successfully!",
        source: "redis",
        data: JSON.parse(cachedBlogs),
      });
    }

    const blogs = await Blog.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
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

    await redisClient.set(cacheKey, JSON.stringify(blogs), {
      EX: 60 * 10,
    }); 

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  },
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const cacheKey = `category:id:${req.params.id}`;

    const cachedCategory = await redisClient.get(cacheKey);
    if (cachedCategory) {
      return res.status(200).json({
        success: true,
        message: "Fetched Category Successfully!",
        source: "redis",
        data: JSON.parse(cachedCategory),
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    await redisClient.set(cacheKey, JSON.stringify(category), {
      EX: 60 * 10,
    });

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

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    await redisClient.del("category:all");
    await redisClient.del(`category:${existingCategory.slug}`);
    await redisClient.del(`category:id:${req.params.id}`);
    await redisClient.del(`category:blogs:${existingCategory.slug}`);
    await redisClient.del("dashboard:stats");

    if (updateData.slug && updateData.slug !== existingCategory.slug) {
      await redisClient.del(`category:${updateData.slug}`);
      await redisClient.del(`category:blogs:${updateData.slug}`);
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
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      const err: any = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    await Blog.deleteMany({ category: categoryId });

    await Category.findByIdAndDelete(categoryId);

    const keys = await redisClient.keys(`category*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    await redisClient.del("dashboard:stats");

    res.status(200).json({
      success: true,
      message: "Category and its blogs deleted successfully",
    });
  },
);
