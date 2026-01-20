import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "../config/Types";
const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Category =
  mongoose.models.Category<ICategory> ||
  mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
