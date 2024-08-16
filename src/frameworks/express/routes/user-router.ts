import expreress from "express"
import UserController from "../../../interface_adapters/controllers/user-controller"
import UserInteractor from "../../../use_cases/userInteractor"
import UserRepository from "../../../interface_adapters/repositories/userRepository"
import Mailer from "../../services/mailer"
import JwtService from "../../services/jwt-generate"
import authMiddleware from "../middlewares/jwt-verify"
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
userRouter.post("/signup/verify-otp",controller.verifyOtpSignup.bind(controller))
userRouter.get("/token/verify",authMiddleware,getUser,verifyRole("user"),controller.verifyToken.bind(controller))
userRouter.post("/login",controller.login.bind(controller))
userRouter.post("/google/signup", controller.googleSignup.bind(controller));
userRouter.post("/google/login", controller.googleLogin.bind(controller));
userRouter.post(
  "/otp/resend",
  authMiddleware,
  controller.resendOtp.bind(controller)
);
userRouter.get("/profile",authMiddleware,getUser,controller.profile.bind(controller))
userRouter.put("/profile",authMiddleware,getUser,controller.profileUpdate.bind(controller))
userRouter.put("/profile/picture",authMiddleware,getUser,upload.single("image"),controller.ProfilePictureUpdate.bind(controller));
userRouter.post("/password/reset-request",controller.passwordResetLink.bind(controller));
userRouter.post("/password/reset/:token",controller.resetPassword.bind(controller));
userRouter.get("/doctor-list",controller.getDoctorList.bind(controller));
userRouter.get("/doctors/:id/profile",controller.getDoctorPage.bind(controller))
userRouter.get("/doctors/:doctorId/availability",authMiddleware,verifyRole("user"),getUser,controller.getAvailableDate.bind(controller));
userRouter.get("/doctors/:doctorId/slots",authMiddleware,verifyRole("user"),getUser,controller.getTimeSlots.bind(controller));
userRouter.post("/appointments/order",authMiddleware,verifyRole("user"),getUser,controller.razorPayOrder.bind(controller))
userRouter.post("/appointments/order/validate",authMiddleware,verifyRole("user"),getUser,controller.razorPayValidate.bind(controller))
userRouter.post("/appointments/lock-slot",authMiddleware,verifyRole("user"),getUser,controller.lockSlot.bind(controller))
userRouter.get("/appointments",authMiddleware,verifyRole("user"),getUser,controller.getAppointments.bind(controller))
userRouter.put("/appointments/:appointmentId/cancel");
userRouter.get("/wallet",authMiddleware,verifyRole("user"),getUser,controller.getWalletInfo.bind(controller))
userRouter.put("/appointments/:appointmentId/cancel",authMiddleware,verifyRole("user"),getUser,controller.cancelAppointment.bind(controller));




export default userRouter

