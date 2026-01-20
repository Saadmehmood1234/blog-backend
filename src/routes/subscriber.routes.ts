import { Router } from "express";
import {
  createSubscriber,
  getSubscriber,
  verifySubscriber,
} from "../controllers/subscriber.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createSubscriber);
router.get("/", getSubscriber);
router.get("/verify", verifySubscriber);
export default router;
