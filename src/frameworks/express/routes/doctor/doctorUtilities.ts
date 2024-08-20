import express from "express";
import DoctorExtraControllers from "../../../../interface_adapters/controllers/doctor/doctorExtra";
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
const controller = new DoctorExtraControllers(interactor);
const doctorUtilitiesRouter = express.Router();

doctorUtilitiesRouter.get(
  "/departments",
  controller.getDepartments.bind(controller)
);
doctorUtilitiesRouter.post(
  "/upload-documents",
  authMiddleware,
  verifyRole("doctor"),
  getDoctor,
  upload.array("images"),
  controller.uploadDocuments.bind(controller)
);
export default doctorUtilitiesRouter;