import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3).max(40),
  password: z.string().min(4).max(40),
  email: z.email().min(3).max(40),
});

export const signinSchema = z.object({
  password: z.string().min(4).max(40),
  email: z.email().min(3).max(40)
});
