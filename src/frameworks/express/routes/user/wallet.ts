import express from "express";
import UserWalletControllers from "../../../../interface_adapters/controllers/user/wallet";
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
const controller = new UserWalletControllers(interactor);
const walletRouter = express.Router();
walletRouter.get(
  "/",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.getWalletInfo.bind(controller)
);
export default walletRouter

