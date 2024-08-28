import express from "express";
import DoctorExtraControllers from "../../../../interface_adapters/controllers/doctor/doctorUtilities";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import { getDoctor } from "../../middlewares/doctor";
import upload from "../../../services/multer";
import DoctorUtilityInteractor from "../../../../use_cases/doctor/doctorUtilities";
import AwsS3 from "../../../services/awsS3";

const awss3=new AwsS3()
const repository = new DoctorRepository();
const interactor = new DoctorUtilityInteractor(repository,awss3);
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
doctorUtilitiesRouter.get("/dash/data",authMiddleware,verifyRole("doctor"),getDoctor,controller.getYearlyRevenue.bind(controller));
export default doctorUtilitiesRouter;