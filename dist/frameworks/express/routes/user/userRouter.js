"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const profile_1 = __importDefault(require("./profile"));
const doctorSearchBooking_1 = __importDefault(require("./doctorSearchBooking"));
const appointments_1 = __importDefault(require("./appointments"));
const wallet_1 = __importDefault(require("./wallet"));
const userRouter = express_1.default.Router();
userRouter.use("/auth", auth_1.default);
userRouter.use("/profile", profile_1.default);
userRouter.use("/doctors", doctorSearchBooking_1.default);
userRouter.use("/appointments", appointments_1.default);
userRouter.use("/wallet", wallet_1.default);
exports.default = userRouter;
