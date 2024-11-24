import express from "express"
import UserProfileControllers from "../../../../interface_adapters/controllers/user/profile";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import Mailer from "../../../services/mailer";
import authMiddleware from "../../middlewares/authentication";
import { getUser } from "../../middlewares/user";
import upload from "../../../services/multer";
import verifyRole from "../../middlewares/role-Authenticate";
import ProfileInteractor from "../../../../use_cases/user/profile";
import AwsS3 from "../../../services/awsS3";

const respository = new UserRepository();
const awsS3=new AwsS3()
const mailer = new Mailer();
const interactor = new ProfileInteractor(respository, mailer,awsS3);
const controller = new UserProfileControllers(interactor);
const profileRouter=express.Router()
profileRouter.get(
  "/",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.profile.bind(controller)
);
profileRouter.put(
  "/",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.profileUpdate.bind(controller)
);
profileRouter.put(
  "/picture",
  authMiddleware,
  verifyRole("user"),
  getUser,
  upload.single("image"),
  controller.ProfilePictureUpdate.bind(controller)
);
profileRouter.post(
  "/password/reset-request",
  controller.passwordResetLink.bind(controller)
);
profileRouter.post(
  "/password/reset/:token",
  controller.resetPassword.bind(controller)
);
profileRouter.get("/isComplete/check",authMiddleware,verifyRole("user"),getUser,controller.isProfileComplete.bind(controller))
profileRouter.get("/notifications/count",authMiddleware,verifyRole("user"),getUser,controller.fetchNotificationCount.bind(controller))
profileRouter.get("/notifications",authMiddleware,verifyRole("user"),getUser,controller.fetchNotifications.bind(controller))
profileRouter.put("/notifications/mark-as-read",authMiddleware,verifyRole("user"),getUser,controller.markNotificationAsRead.bind(controller));
export default profileRouter
