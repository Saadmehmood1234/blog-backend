"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connection.on("connected", () => {
    console.log("MongoDB connection established");
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});
mongoose_1.default.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
});
const connectDB = async (retries = 5, delay = 3000) => {
    const mongo_uri = process.env.MONGODB_URI;
    try {
        if (!mongo_uri) {
            console.error("Mongo url is missing");
            process.exit(1);
        }
        await mongoose_1.default.connect(mongo_uri);
        console.log("Mongodb is connected Successfully");
    }
    catch (error) {
        console.error(` MongoDB connection failed. Retries left: ${retries - 1}`);
        if (retries <= 1) {
            console.error(" All retries exhausted. Exiting...");
            process.exit(1);
        }
        await new Promise((res) => setTimeout(res, delay));
        return connectDB(retries - 1, delay);
    }
};
exports.default = connectDB;
