import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller";
import { protect } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { createBlogsSchema } from "../TypeSchema/blog.schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
// router.post("/", protect,validationMiddleware(createBlogsSchema), createBlog);
router.post("/", upload.single("image"), createBlog);
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

export default router;
