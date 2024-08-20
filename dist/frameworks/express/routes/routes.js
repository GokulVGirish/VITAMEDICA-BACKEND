"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRouter_1 = __importDefault(require("./user/userRouter"));
const adminRouter_1 = __importDefault(require("./admin/adminRouter"));
const doctorRouter_1 = __importDefault(require("./doctor/doctorRouter"));
const routes = (app) => {
    app.use("/api/users", userRouter_1.default);
    app.use("/api/admin", adminRouter_1.default);
    app.use("/api/doctors", doctorRouter_1.default);
};
exports.default = routes;
