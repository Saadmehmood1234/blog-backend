import { NextFunction, Request, Response } from "express";
import Blog from "../model/Blog";
import View from "../model/View";
import asyncHandler from "../utils/asyncHandler";
import redisClient from "../config/redis";
import Category from "../model/Category";
export const dashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const cacheKey = "dashboard:stats";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      try {
        const stats = JSON.parse(cachedData);
        return res.status(200).json(stats);
      } catch (err) {
        console.error("Redis parse error", err);
      }
    }

    const totalBlogs = await Blog.countDocuments();
    const totalCategory = await Category.countDocuments();
    const totalViews = await View.countDocuments();
    const topBlogs = await Blog.find()
      .sort({ views: -1 })
      .limit(5)
      .select("title views");
    const dailyViews = await View.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
    const stats = {
      totalBlogs,
      totalViews,
      topBlogs,
      dailyViews,
      totalCategory,
    };
    await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 10 * 60 });
    res.json(stats);
  },
);
