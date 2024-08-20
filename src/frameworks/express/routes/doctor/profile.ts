import express from "express";
import DoctorProfileControllers from "../../../../interface_adapters/controllers/doctor/profile";
import DoctorInteractor from "../../../../use_cases/doctorInteractor";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import Mailer from "../../../services/mailer";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import { getDoctor } from "../../middlewares/doctor";
import upload from "../../../services/multer";
const mailer = new Mailer();
const jwtService = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const repository = new DoctorRepository();
const interactor = new DoctorInteractor(repository, mailer, jwtService);
const controller = new DoctorProfileControllers(interactor);
const profileRouter = express.Router();

profileRouter.get(
  "/",
  authMiddleware,
  getDoctor,
  controller.getProfile.bind(controller)
);
profileRouter.post(
  "/picture",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  upload.single("image"),
  controller.UpdateProfileImage.bind(controller)
);
profileRouter.put(
  "/",
  authMiddleware,
  getDoctor,
  verifyRole("doctor"),
  controller.DoctorProfileUpdate.bind(controller)
);
export default profileRouter
