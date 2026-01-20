import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(2),
});
