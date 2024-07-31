"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../../../interface_adapters/controllers/user-controller"));
const userInteractor_1 = __importDefault(require("../../../use_cases/userInteractor"));
const userRepository_1 = __importDefault(require("../../../interface_adapters/repositories/userRepository"));
const mailer_1 = __importDefault(require("../../services/mailer"));
const jwt_generate_1 = __importDefault(require("../../services/jwt-generate"));
const jwt_verify_1 = __importDefault(require("../../services/jwt-verify"));
const user_1 = require("../middlewares/user");
const role_Authenticate_1 = __importDefault(require("../middlewares/role-Authenticate"));
const multer_1 = __importDefault(require("../../services/multer"));
const repository = new userRepository_1.default();
const mailer = new mailer_1.default();
const jwtservices = new jwt_generate_1.default(process.env.ACCESS_TOCKEN_SECRET, process.env.REFRESH_TOCKEN_SECRET);
const interactor = new userInteractor_1.default(repository, mailer, jwtservices);
const controller = new user_controller_1.default(interactor);
const userRouter = express_1.default.Router();
userRouter.post("/signup", controller.otpSignup.bind(controller));
userRouter.post("/verifyOtpSignup", controller.verifyOtpSignup.bind(controller));
userRouter.get("/verify-token", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.verifyToken.bind(controller));
userRouter.post("/login", controller.login.bind(controller));
userRouter.post("/googleSignup", controller.googleSignup.bind(controller));
userRouter.post("/googleLogin", controller.googleLogin.bind(controller));
userRouter.post("/resendOtp", jwt_verify_1.default, controller.resendOtp.bind(controller));
userRouter.get("/profile", jwt_verify_1.default, user_1.getUser, controller.profile.bind(controller));
userRouter.post("/profileUpdate", jwt_verify_1.default, user_1.getUser, multer_1.default.single("image"), controller.profileUpdate.bind(controller));
exports.default = userRouter;
