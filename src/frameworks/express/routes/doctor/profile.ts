import express from "express";
import DoctorProfileControllers from "../../../../interface_adapters/controllers/doctor/profile";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import Mailer from "../../../services/mailer";
import authMiddleware from "../../middlewares/authentication";
import verifyRole from "../../middlewares/role-Authenticate";
import { getDoctor } from "../../middlewares/doctor";
import upload from "../../../services/multer";
import DoctorProfileInteractor from "../../../../use_cases/doctor/profile";
import AwsS3 from "../../../services/awsS3";


const mailer = new Mailer();
const awss3 = new AwsS3();
const repository = new DoctorRepository();
const interactor = new DoctorProfileInteractor(repository, mailer,awss3);
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
profileRouter.get("/isComplete/check",authMiddleware,verifyRole("doctor"),getDoctor,controller.isProfileCompleted.bind(controller));
profileRouter.post("/password/reset-request",controller.passwordResetLink.bind(controller));
profileRouter.post("/password/reset/:token",controller.resetPassword.bind(controller));
profileRouter.get("/notifications/count",authMiddleware,verifyRole("doctor"),getDoctor,controller.fetchNotificationCount.bind(controller))
profileRouter.get(
  "/notifications",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.fetchNotifications.bind(controller)
);
profileRouter.put(
  "/notifications/mark-as-read",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor
  ,controller.markNotificationAsRead.bind(controller)
);
export default profileRouter
