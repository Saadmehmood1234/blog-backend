import dotenv from "dotenv";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
dotenv.config();
import app from "./app";
const server = async () => {
  await connectRedis();
  await connectDB();
  const PORT = Number(process.env.PORT) || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`App is running on port ${PORT}`);
  });
};

server();
