import express from "express";
import UserAuthControllers from "../../../../interface_adapters/controllers/user/auth";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import Mailer from "../../../services/mailer";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/authentication";
import { getUser } from "../../middlewares/user";
import verifyRole from "../../middlewares/role-Authenticate";
import UserAuthInteractor from "../../../../use_cases/user/auth";
import { loginLimiter } from "../../middlewares/rateLimiter";

const respository = new UserRepository();
const mailer = new Mailer();
const jwtservices = new JwtService(
  process.env.ACCESS_TOKEN_SECRET as string,
  process.env.REFRESH_TOKEN_SECRET as string
);
const interactor = new UserAuthInteractor(respository, mailer, jwtservices);
const controller = new UserAuthControllers(interactor);
const authRouter = express.Router();
authRouter.post("/login", loginLimiter, controller.login.bind(controller));
authRouter.post("/signup", controller.otpSignup.bind(controller));
authRouter.post(
  "/signup/verify-otp",
  controller.verifyOtpSignup.bind(controller)
);
authRouter.get(
  "/token/verify-token",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.verifyToken.bind(controller)
);
authRouter.post(`/logout`,controller.logout.bind(controller))
authRouter.post("/google/login", controller.googleLogin.bind(controller));
authRouter.post(
  "/otp/resend",
  authMiddleware,
  controller.resendOtp.bind(controller)
);
export default authRouter
