import { NextFunction, Request, Response } from "express";
import Blog from "../model/Blog";
import View from "../model/View";
import asyncHandler from "../utils/asyncHandler";
import redisClient from "../config/redis";
import { filterQuery } from "../utils/FilterQuery";
import { QueryType } from "../config/Types";
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.create(req.body);
  await redisClient.del("blogs:all");
  res.status(201).json({
    success: true,
    message: "Blog created Successfully!",
    data: blog,
  });
});


export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    title,
    category,
    isFeatured,
    tags,
    search,
    readTime,
    createdAt,
  } = req.query as QueryType;

  const filterValue: QueryType = {
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
    console.log("Test",search,limit)

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
  const filterData = filterQuery(filterValue);

  Object.keys(filterData).forEach((key) => {
    if (
      filterData[key] === "" ||
      filterData[key] === undefined ||
      (Array.isArray(filterData[key]) && filterData[key].length === 0)
    ) {
      delete filterData[key];
    }
  });

  const blogs = await Blog.find(filterData)
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
  await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 5 * 60 });
  res.status(200).json({
    success: true,
    message: "Fetched Blog Successfully!",
    count: blogs.length,
    data: blogs,
  });
});

export const getBlogBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const slug = req?.params?.slug;
    if (!slug) {
      const error: any = new Error("Slug is missing");
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
    const blog = await Blog.findOne({ slug }).populate("category");

    if (!blog) {
      const error: any = new Error("No blogs found");
      error.statusCode = 404;
      throw error;
    }
    blog.views += 1;
    await blog.save();

    await View.create({
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
  },
);

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const updateData = Object.fromEntries(
    Object.entries(req.body).filter(
      ([_, value]) => value !== null && value !== "",
    ),
  );
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!blog) {
    const error: any = new Error("Blog not found");
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

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    const error: any = new Error("Blog not found");
    error.statusCode = 404;
    throw error;
  }
  await redisClient.del("blogs:all");
  await redisClient.del(`blog:${blog.slug}`);
  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});
