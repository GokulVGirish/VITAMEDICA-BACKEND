import express from "express";
import UserAppointmentControllers from "../../../../interface_adapters/controllers/user/appointments";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import { getUser } from "../../middlewares/user";
import verifyRole from "../../middlewares/role-Authenticate";
import UserAppointmentsInteractor from "../../../../use_cases/user/appointments";
import AwsS3 from "../../../services/awsS3";
import upload from "../../../services/multer";

const respository = new UserRepository();
const awsS3=new AwsS3()
const interactor = new UserAppointmentsInteractor(respository,awsS3);
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
appointmentRouter.post("/book/wallet",authMiddleware,verifyRole("user"),getUser,controller.bookFromWallet.bind(controller))
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
appointmentRouter.post("/medicalRecords/:appointmentId",authMiddleware,verifyRole("user"),upload.array("medicalRecords"),controller.medicalRecordsUpload.bind(controller))
export default appointmentRouter
