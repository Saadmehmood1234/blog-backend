import { Router } from "express";
import { dashboardStats } from "../controllers/analytics.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();
router.get("/dashboard-stats", dashboardStats);
export default router;
