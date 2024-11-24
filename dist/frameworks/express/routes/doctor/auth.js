"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../../interface_adapters/controllers/doctor/auth"));
const doctorRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/doctorRepository"));
const mailer_1 = __importDefault(require("../../../services/mailer"));
const jwt_generate_1 = __importDefault(require("../../../services/jwt-generate"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const doctor_1 = require("../../middlewares/doctor");
const auth_2 = __importDefault(require("../../../../use_cases/doctor/auth"));
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const mailer = new mailer_1.default();
const jwtService = new jwt_generate_1.default(process.env.ACCESS_TOKEN_SECRET, process.env.REFRESH_TOKEN_SECRET);
const repository = new doctorRepository_1.default();
const interactor = new auth_2.default(repository, mailer, jwtService);
const controller = new auth_1.default(interactor);
const authRouter = express_1.default.Router();
authRouter.post("/signup", controller.otpSignup.bind(controller));
authRouter.get("/token/verify-token", authentication_1.default, (0, role_Authenticate_1.default)("doctor"), doctor_1.getDoctor, controller.verifyToken.bind(controller));
authRouter.post("/signup/verify-otp", authentication_1.default, controller.verifyOtpSignup.bind(controller));
authRouter.post("/login", rateLimiter_1.loginLimiter, controller.login.bind(controller));
authRouter.post(`/logout`, controller.logout.bind(controller));
authRouter.post("/otp/resend", authentication_1.default, controller.resendOtp.bind(controller));
exports.default = authRouter;
