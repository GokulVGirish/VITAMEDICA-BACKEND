import express from "express";
import DoctorController from "../../../interface_adapters/controllers/doctor-controller";
import DoctorInteractor from "../../../use_cases/doctorInteractor";
import DoctorRepository from "../../../interface_adapters/repositories/doctorRepository";
import Mailer from "../../services/mailer";
import JwtService from "../../services/jwt-generate";
import authMiddleware from "../../services/jwt-verify";
import verifyRole from "../middlewares/role-Authenticate";
import { getDoctor } from "../middlewares/doctor";
import upload from "../../services/multer";

const fields = [
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
  { name: "file3", maxCount: 1 },
  { name: "file4", maxCount: 1 },
];

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

export default doctorRouter;
