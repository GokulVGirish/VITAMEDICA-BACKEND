import expreress from "express"
import UserController from "../../../interface_adapters/controllers/user-controller"
import UserInteractor from "../../../use_cases/userInteractor"
import UserRepository from "../../../interface_adapters/repositories/userRepository"
import Mailer from "../../services/mailer"
import JwtService from "../../services/jwt-generate"
import authMiddleware from "../../services/jwt-verify"
import { getUser } from "../middlewares/user"

import verifyRole from "../middlewares/role-Authenticate"
import upload from "../../services/multer"


const repository=new UserRepository()
const mailer=new Mailer()
const jwtservices=new JwtService(process.env.ACCESS_TOCKEN_SECRET as string,process.env.REFRESH_TOCKEN_SECRET as string)
const interactor=new UserInteractor(repository,mailer,jwtservices)
const controller=new UserController(interactor)
const userRouter=expreress.Router()
userRouter.post("/signup",controller.otpSignup.bind(controller))
userRouter.post("/verifyOtpSignup",controller.verifyOtpSignup.bind(controller))
userRouter.get(
  "/verify-token",
  authMiddleware,
  verifyRole("user"),
  getUser,controller.verifyToken.bind(controller)
);
userRouter.post("/login",controller.login.bind(controller))
userRouter.post("/googleSignup",controller.googleSignup.bind(controller))
userRouter.post("/googleLogin",controller.googleLogin.bind(controller))
userRouter.post(
  "/resendOtp",
  authMiddleware,
  controller.resendOtp.bind(controller)
);
userRouter.get("/profile",authMiddleware,getUser,controller.profile.bind(controller))
userRouter.post("/profileUpdate",authMiddleware,getUser,upload.single("image"),controller.profileUpdate.bind(controller))



export default userRouter

