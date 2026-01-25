import express from "express";
import { validationMiddleware } from "../middleware/validation.middleware";
import { signinSchema, signupSchema } from "../TypeSchema/auth.schema";
import {
  signin,
  signout,
  signup,
  verifyUser,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", validationMiddleware(signupSchema), signup);
router.post("/signin", validationMiddleware(signinSchema), signin);
router.post("/signout", protect, signout);
router.get("/me", protect, (req, res) => {
  console.log("are we calling it",(req as any).user);
  res.json({
    user: (req as any).user,
  });
});

router.get("/verify", verifyUser);
export default router;
