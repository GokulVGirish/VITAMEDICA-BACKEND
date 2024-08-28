import express from "express";
import DoctorSlotsControllers from "../../../../interface_adapters/controllers/doctor/slot";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import { getDoctor } from "../../middlewares/doctor";
import DoctorSlotsInteractor from "../../../../use_cases/doctor/slot";

const repository = new DoctorRepository();
const interactor = new DoctorSlotsInteractor(repository);
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