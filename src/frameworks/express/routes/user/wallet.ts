import express from "express";
import UserWalletControllers from "../../../../interface_adapters/controllers/user/wallet";
import UserWalletInteractor from "../../../../use_cases/user/wallet";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import authMiddleware from "../../middlewares/authentication";
import { getUser } from "../../middlewares/user";
import verifyRole from "../../middlewares/role-Authenticate";

const respository = new UserRepository();
const interactor = new UserWalletInteractor(respository);
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

