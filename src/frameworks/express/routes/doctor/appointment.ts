import express from "express";
import DoctorAppointmentControllers from "../../../../interface_adapters/controllers/doctor/appointment";
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
const controller = new DoctorAppointmentControllers(interactor);
const appointmentRouter = express.Router();
appointmentRouter.get(
  "/today",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.todaysAppointments.bind(controller)
);
appointmentRouter.get(
  "/upcomming",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.getUpcommingAppointments.bind(controller)
);
appointmentRouter.get(
  `/:id`,
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.getAppointmentDetails.bind(controller)
);
appointmentRouter.put(
  `/:appointmentId/prescriptions`,
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  upload.single("prescription"),
  controller.addPrescription.bind(controller)
);

export default appointmentRouter
