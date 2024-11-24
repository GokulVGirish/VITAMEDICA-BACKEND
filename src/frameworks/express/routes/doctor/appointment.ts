import express from "express";
import DoctorAppointmentControllers from "../../../../interface_adapters/controllers/doctor/appointment";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import authMiddleware from "../../middlewares/authentication";
import verifyRole from "../../middlewares/role-Authenticate";
import { getDoctor } from "../../middlewares/doctor";
import upload from "../../../services/multer";
import DoctorAppointmentInteractor from "../../../../use_cases/doctor/appointments";
import AwsS3 from "../../../services/awsS3";



const awss3 = new AwsS3();
const repository = new DoctorRepository();
const interactor = new DoctorAppointmentInteractor(repository,awss3);
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
  "/filter/:days",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  controller.getUpcommingOrPrevAppointments.bind(controller)
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
