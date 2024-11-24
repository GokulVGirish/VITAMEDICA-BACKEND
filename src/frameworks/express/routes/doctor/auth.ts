import express from "express"
import DoctorAuthControllers from "../../../../interface_adapters/controllers/doctor/auth"
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository"
import Mailer from "../../../services/mailer"
import JwtService from "../../../services/jwt-generate"
import authMiddleware from "../../middlewares/authentication"
import verifyRole from "../../middlewares/role-Authenticate"
import { getDoctor } from "../../middlewares/doctor"
import DoctorAuthInteractor from "../../../../use_cases/doctor/auth"
import { loginLimiter } from "../../middlewares/rateLimiter"

const mailer = new Mailer();
const jwtService = new JwtService(
  process.env.ACCESS_TOKEN_SECRET as string,
  process.env.REFRESH_TOKEN_SECRET as string
);
const repository = new DoctorRepository();
const interactor = new DoctorAuthInteractor(repository, mailer, jwtService);
const controller = new DoctorAuthControllers(interactor);
const authRouter=express.Router()
authRouter.post("/signup", controller.otpSignup.bind(controller));
authRouter.get(
  "/token/verify-token",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.verifyToken.bind(controller)
);
authRouter.post(
  "/signup/verify-otp",
  authMiddleware,
  controller.verifyOtpSignup.bind(controller)
);
authRouter.post("/login",loginLimiter, controller.login.bind(controller));
authRouter.post(`/logout`,controller.logout.bind(controller))
authRouter.post(
  "/otp/resend",
  authMiddleware,
  controller.resendOtp.bind(controller)
);

export default authRouter