import express from "express"
import UserProfileControllers from "../../../../interface_adapters/controllers/user/profile";
import UserInteractor from "../../../../use_cases/userInteractor";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import Mailer from "../../../services/mailer";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import { getUser } from "../../middlewares/user";
import upload from "../../../services/multer";
import verifyRole from "../../middlewares/role-Authenticate";

const respository = new UserRepository();
const mailer = new Mailer();
const jwtservices = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const interactor = new UserInteractor(respository, mailer, jwtservices);
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
export default profileRouter
