"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_router_1 = __importDefault(require("./user-router"));
const admin_router_1 = __importDefault(require("./admin-router"));
const doctor_router_1 = __importDefault(require("./doctor-router"));
const routes = (app) => {
    app.use("/api/users", user_router_1.default);
    app.use("/admin", admin_router_1.default);
    app.use("/doctor", doctor_router_1.default);
};
exports.default = routes;
