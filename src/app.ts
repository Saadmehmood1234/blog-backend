import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import errorMiddleware from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import blogsRoutes from "./routes/blog.routes";
import subscriberRoutes from "./routes/subscriber.routes";
import categoryRoutes from "./routes/category.routes";
import analyticsRoutes from "./routes/analytics.routes";
import cookieParser from "cookie-parser";
import { rateLimiter } from "./middleware/rateLimit.middleware";
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blogs", blogsRoutes);
app.use("/api/v1/subscribe", subscriberRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use(rateLimiter);
app.use(errorMiddleware);
export default app;
