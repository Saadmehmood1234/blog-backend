"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardStats = void 0;
const Blog_1 = __importDefault(require("../model/Blog"));
const View_1 = __importDefault(require("../model/View"));
const dashboardStats = async (req, res) => {
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
    res.json({
        totalBlogs,
        totalViews,
        topBlogs,
        dailyViews,
    });
};
exports.dashboardStats = dashboardStats;
