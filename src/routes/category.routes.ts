import express from "express";
import {
  createCategory,
  getAllCategory,
  getCategoryBySlug,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getBlogsByCategorySlug,
} from "../controllers/category.controller";
import { protect } from "../middleware/auth.middleware";
import multer from "multer";
const router = express.Router();
const upload = multer(); 
router.post("/", protect,upload.none(), createCategory);
router.get("/", getAllCategory);
router.get("/:slug", getBlogsByCategorySlug);
router.get("/:id", getCategoryById);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);
export default router;
