import express from "express";
import DoctorSearchBookingControllers from "../../../../interface_adapters/controllers/user/doctorSearchBooking";
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
const controller = new DoctorSearchBookingControllers(interactor);
const doctorSearchBookingRouter = express.Router();
doctorSearchBookingRouter.get(
  "/list",
  controller.getDoctorList.bind(controller)
);
doctorSearchBookingRouter.get("/category",controller.getDoctorsByDepartment.bind(controller));
doctorSearchBookingRouter.get(
  "/search",
  controller.getDoctorBySearch.bind(controller)
);
doctorSearchBookingRouter.get(
  "/:id/profile",
  controller.getDoctorPage.bind(controller)
);
doctorSearchBookingRouter.get(
  "/:doctorId/availability",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.getAvailableDate.bind(controller)
);
doctorSearchBookingRouter.get(
  "/:doctorId/slots",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.getTimeSlots.bind(controller)
);


export default doctorSearchBookingRouter
