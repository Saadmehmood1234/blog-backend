import dotenv from "dotenv";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
dotenv.config();
import app from "./app";
const server = async () => {
  const PORT = process.env.PORT;
  await connectRedis()
  await connectDB();
  app.listen(PORT || 5000, () => {
    console.log(`App is running at port ${PORT}`);
  });
};

server()