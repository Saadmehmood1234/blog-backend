import express from "express";
import { validationMiddleware } from "../middleware/validation.middleware";
import { signinSchema, signupSchema } from "../TypeSchema/auth.schema";
import { signin, signout, signup } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", validationMiddleware(signupSchema), signup);
router.post("/signin", validationMiddleware(signinSchema), signin);
router.post("/signout", protect, signout);
export default router;
