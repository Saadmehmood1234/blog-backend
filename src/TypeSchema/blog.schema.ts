import { z } from "zod";

export const createBlogsSchema = z.object({
  title: z.string().min(2).max(150),
  slug: z.string().min(2),
  content: z.string().min(2),
  excerpt: z.string().min(2),
  tags: z.array(z.string()),
  featuredImage: z.string(),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(2),
  isFeatured: z.boolean(),
  status: z.enum(["draft", "published"]),
  readTime: z.number(),
});
