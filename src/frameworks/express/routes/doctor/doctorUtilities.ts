import express from "express";
import DoctorExtraControllers from "../../../../interface_adapters/controllers/doctor/doctorUtilities";
import DoctorRepository from "../../../../interface_adapters/repositories/doctorRepository";
import authMiddleware from "../../middlewares/authentication";
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
doctorUtilitiesRouter.get("/dash/today",authMiddleware,verifyRole("doctor"),getDoctor,controller.getTodaysRevenue.bind(controller));
doctorUtilitiesRouter.get("/dash/weekly",authMiddleware,verifyRole("doctor"),getDoctor,controller.getWeeklyRevenue.bind(controller))
doctorUtilitiesRouter.get("/dash/monthly",authMiddleware,verifyRole("doctor"),getDoctor,controller.getMonthlyRevenue.bind(controller))
doctorUtilitiesRouter.get("/dash/yearly",authMiddleware,verifyRole("doctor"),getDoctor,controller.getYearlyRevenue.bind(controller))

export default doctorUtilitiesRouter;