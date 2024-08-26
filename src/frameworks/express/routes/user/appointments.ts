import express from "express";
import UserAppointmentControllers from "../../../../interface_adapters/controllers/user/appointments";
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
const controller = new UserAppointmentControllers(interactor);
const appointmentRouter = express.Router();
appointmentRouter.post(
  "/order",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.razorPayOrder.bind(controller)
);
appointmentRouter.post(
  "/order/validate",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.razorPayValidate.bind(controller)
);
appointmentRouter.post(
  "/lock-slot",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.lockSlot.bind(controller)
);
appointmentRouter.get(
  "/",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.getAppointments.bind(controller)
);
appointmentRouter.put(
  "/:appointmentId/cancel",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.cancelAppointment.bind(controller)
);
appointmentRouter.put(
  `/:appointmentId/review`,
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.addReview.bind(controller)
);
appointmentRouter.get("/:appointmentId/detail",authMiddleware,verifyRole("user"),getUser,controller.getAppointmentDetail.bind(controller))
export default appointmentRouter
