"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../../interface_adapters/controllers/user/auth"));
const userRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/userRepository"));
const mailer_1 = __importDefault(require("../../../services/mailer"));
const jwt_generate_1 = __importDefault(require("../../../services/jwt-generate"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const user_1 = require("../../middlewares/user");
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const auth_2 = __importDefault(require("../../../../use_cases/user/auth"));
const respository = new userRepository_1.default();
const mailer = new mailer_1.default();
const jwtservices = new jwt_generate_1.default(process.env.ACCESS_TOCKEN_SECRET, process.env.REFRESH_TOCKEN_SECRET);
const interactor = new auth_2.default(respository, mailer, jwtservices);
const controller = new auth_1.default(interactor);
const authRouter = express_1.default.Router();
authRouter.post("/signup", controller.otpSignup.bind(controller));
authRouter.post("/signup/verify-otp", controller.verifyOtpSignup.bind(controller));
authRouter.get("/token/verify-token", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.verifyToken.bind(controller));
authRouter.post("/login", controller.login.bind(controller));
authRouter.post("/google/login", controller.googleLogin.bind(controller));
authRouter.post("/otp/resend", jwt_verify_1.default, controller.resendOtp.bind(controller));
exports.default = authRouter;
