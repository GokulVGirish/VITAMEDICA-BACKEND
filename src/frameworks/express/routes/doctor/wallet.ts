import express from "express";
import DoctorWalletControllers from "../../../../interface_adapters/controllers/doctor/wallet";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import { getDoctor } from "../../middlewares/doctor";
import DoctorWalletInteractor from "../../../../use_cases/doctor/wallet";

const repository = new DoctorRepository();
const interactor = new DoctorWalletInteractor(repository);
const controller = new DoctorWalletControllers(interactor);
const walletRouter = express.Router();
walletRouter.get(
  "/",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.getWalletDetails.bind(controller)
);
walletRouter.post("/withdraw/:amount",authMiddleware,verifyRole("doctor"),getDoctor,controller.withdrawFromWallet.bind(controller))
export default walletRouter
