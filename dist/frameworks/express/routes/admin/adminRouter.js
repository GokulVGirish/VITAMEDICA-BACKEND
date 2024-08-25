"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const department_1 = __importDefault(require("./department"));
const userManagement_1 = __importDefault(require("./userManagement"));
const doctorManagement_1 = __importDefault(require("./doctorManagement"));
const dashboard_1 = __importDefault(require("./dashboard"));
const adminRouter = express_1.default.Router();
adminRouter.use("/auth", auth_1.default);
adminRouter.use("/departments", department_1.default);
adminRouter.use("/users", userManagement_1.default);
adminRouter.use("/doctors", doctorManagement_1.default);
adminRouter.use("/dashboard", dashboard_1.default);
exports.default = adminRouter;
