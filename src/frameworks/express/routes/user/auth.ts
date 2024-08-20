import express from "express";
import UserAuthControllers from "../../../../interface_adapters/controllers/user/auth";
import UserInteractor from "../../../../use_cases/userInteractor";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import Mailer from "../../../services/mailer";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import { getUser } from "../../middlewares/user";
import verifyRole from "../../middlewares/role-Authenticate";

const respository = new UserRepository();
const mailer = new Mailer();
const jwtservices = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const interactor = new UserInteractor(respository, mailer, jwtservices);
const controller = new UserAuthControllers(interactor);
const authRouter = express.Router();
authRouter.post("/signup", controller.otpSignup.bind(controller));
authRouter.post(
  "/signup/verify-otp",
  controller.verifyOtpSignup.bind(controller)
);
authRouter.get(
  "/token/verify",
  authMiddleware,
  getUser,
  verifyRole("user"),
  controller.verifyToken.bind(controller)
);
authRouter.post("/login", controller.login.bind(controller));
authRouter.post("/google/signup", controller.googleSignup.bind(controller));
authRouter.post("/google/login", controller.googleLogin.bind(controller));
authRouter.post(
  "/otp/resend",
  authMiddleware,
  controller.resendOtp.bind(controller)
);
export default authRouter