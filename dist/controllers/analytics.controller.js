"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardStats = void 0;
const Blog_1 = __importDefault(require("../model/Blog"));
const View_1 = __importDefault(require("../model/View"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
exports.dashboardStats = (0, asyncHandler_1.default)(async (req, res) => {
    // const cacheKey = "dashboard:stats";
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "redis",
    //     data: JSON.parse(cachedData),
    //   });
    // }
    const totalBlogs = await Blog_1.default.countDocuments();
    const totalViews = await View_1.default.countDocuments();
    const topBlogs = await Blog_1.default.find()
        .sort({ views: -1 })
        .limit(5)
        .select("title views");
    const dailyViews = await View_1.default.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                views: { $sum: 1 },
            },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 },
    ]);
    const stats = { totalBlogs, totalViews, topBlogs, dailyViews };
    // await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 10 * 60 });
    res.json({
        totalBlogs,
        totalViews,
        topBlogs,
        dailyViews,
    });
});
