import mongoose, { Schema, Document } from "mongoose";
import { IBlog } from "../config/Types";
const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String, index: true }],
    featuredImage: { type: String, required: true },

    seoTitle: { type: String, required: true },
    seoDescription: { type: String, required: true },

    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    views: { type: Number, default: 0 },
    readTime: { type: Number },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog<IBlog> || mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;
