"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const subscriber_routes_1 = __importDefault(require("./routes/subscriber.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use(body_parser_1.default.json());
app.use(rateLimit_middleware_1.rateLimiter);
app.use((0, cookie_parser_1.default)());
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/blogs", blog_routes_1.default);
app.use("/api/v1/subscribe", subscriber_routes_1.default);
app.use("/api/v1/categories", category_routes_1.default);
app.use("/api/v1/analytics", analytics_routes_1.default);
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(error_middleware_1.default);
exports.default = app;
