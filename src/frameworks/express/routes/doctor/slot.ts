import express from "express";
import DoctorSlotsControllers from "../../../../interface_adapters/controllers/doctor/slot";
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
const controller = new DoctorSlotsControllers(interactor);
const slotRouter = express.Router();
slotRouter.post(
  "/",
  authMiddleware,
  getDoctor,
  verifyRole("doctor"),
  controller.addSlots.bind(controller)
);
slotRouter.get(
  "/available-dates",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.getAvailableDates.bind(controller)
);
slotRouter.get(
  "/",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.getTimeSlots.bind(controller)
);
slotRouter.delete(
  `/unbooked`,
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.deleteUnbookedTimeSlots.bind(controller)
);
slotRouter.delete(
  `/booked`,
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.deleteBookedTimeSlots.bind(controller)
);
export default slotRouter