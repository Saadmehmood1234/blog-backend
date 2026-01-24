"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_schema_1 = require("../TypeSchema/auth.schema");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/signup", (0, validation_middleware_1.validationMiddleware)(auth_schema_1.signupSchema), auth_controller_1.signup);
router.post("/signin", (0, validation_middleware_1.validationMiddleware)(auth_schema_1.signinSchema), auth_controller_1.signin);
router.post("/signout", auth_middleware_1.protect, auth_controller_1.signout);
router.get("/verify", auth_controller_1.verifyUser);
exports.default = router;
