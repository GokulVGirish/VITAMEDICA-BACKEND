import express from "express";
import DoctorController from "../../../interface_adapters/controllers/doctor-controller";
import DoctorInteractor from "../../../use_cases/doctorInteractor";
import DoctorRepository from "../../../interface_adapters/repositories/doctorRepository";
import Mailer from "../../services/mailer";
import JwtService from "../../services/jwt-generate";
import authMiddleware from "../middlewares/jwt-verify";
import verifyRole from "../middlewares/role-Authenticate";
import { getDoctor } from "../middlewares/doctor";
import upload from "../../services/multer";

const mailer = new Mailer();
const jwtService = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const repository = new DoctorRepository();
const interactor = new DoctorInteractor(repository, mailer, jwtService);
const controller = new DoctorController(interactor);
const doctorRouter = express.Router();
doctorRouter.get("/department",controller.getDepartments.bind(controller))
doctorRouter.post("/signup", controller.otpSignup.bind(controller));
doctorRouter.get("/verify-token",authMiddleware,verifyRole("doctor"),getDoctor,controller.verifyToken.bind(controller));
doctorRouter.post("/verifyOtpSignup",authMiddleware,controller.verifyOtpSignup.bind(controller));
doctorRouter.post("/login",controller.login.bind(controller))
doctorRouter.get("/profile",authMiddleware,getDoctor,controller.getProfile.bind(controller));
doctorRouter.post("/docUpload",authMiddleware,verifyRole("doctor"),getDoctor,upload.array("images"),controller.uploadDocuments.bind(controller));
doctorRouter.post("/resendOtp",authMiddleware,controller.resendOtp.bind(controller));
doctorRouter.post("/profilePicUpdate",authMiddleware,verifyRole("doctor"),getDoctor,upload.single("image"),controller.UpdateProfileImage.bind(controller));
doctorRouter.put("/profileUpdate",authMiddleware,getDoctor,verifyRole("doctor"),controller.DoctorProfileUpdate.bind(controller))
doctorRouter.post("/add-slot",authMiddleware,getDoctor,verifyRole("doctor"),controller.addSlots.bind(controller));
doctorRouter.get("/doctor-wallet",authMiddleware,verifyRole("doctor"),getDoctor,controller.getWalletDetails.bind(controller));
doctorRouter.get('/todays-appointments',authMiddleware,verifyRole("doctor"),getDoctor,controller.todaysAppointments.bind(controller));
doctorRouter.get("/upcomming-appointments",authMiddleware,verifyRole("doctor"),getDoctor,controller.getUpcommingAppointments.bind(controller))
doctorRouter.get("/getAvailableDates",authMiddleware,verifyRole("doctor"),getDoctor,controller.getAvailableDates.bind(controller))
doctorRouter.get("/slots",authMiddleware,verifyRole("doctor"),getDoctor,controller.getTimeSlots.bind(controller))
doctorRouter.delete(`/cancelUnbookedSlots`,authMiddleware,verifyRole("doctor"),getDoctor,controller.deleteUnbookedTimeSlots.bind(controller));
doctorRouter.delete(`/cancelBookedSlots`,authMiddleware,verifyRole("doctor"),getDoctor,controller.deleteBookedTimeSlots.bind(controller))


export default doctorRouter;
