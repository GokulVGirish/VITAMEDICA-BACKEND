import express from "express";
import AdminDoctorManagementControllers from "../../../../interface_adapters/controllers/admin/doctorManagement";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import authMiddleware from "../../middlewares/authentication";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminDoctorManagementInteractor from "../../../../use_cases/admin/doctorManagement";
import AwsS3 from "../../../services/awsS3";

const awsS3 = new AwsS3();
const repository = new AdminRepository();
const interactor = new AdminDoctorManagementInteractor(repository,awsS3);
const controller = new AdminDoctorManagementControllers(interactor);
const doctorManagementRouter = express.Router();

doctorManagementRouter.get(
  "/unverified",
  authMiddleware,
  verifyRole("admin"),
  controller.getUnverifiedDoctors.bind(controller)
);
doctorManagementRouter.get(
  "/:id/documents",
  authMiddleware,
  verifyRole("admin"),
  controller.getDoctorDocs.bind(controller)
);
doctorManagementRouter.put(
  "/:id/verify",
  authMiddleware,
  verifyRole("admin"),
  controller.verifyDoctor.bind(controller)
);
doctorManagementRouter.get("/:id/profile",authMiddleware,verifyRole("admin"),controller.getDoctorProfile.bind(controller))
doctorManagementRouter.get(
  "/",
  authMiddleware,
  verifyRole("admin"),
  controller.getDoctors.bind(controller)
);
doctorManagementRouter.put(
  "/:id/:status",
  authMiddleware,
  verifyRole("admin"),
  controller.doctorBlockUnblock.bind(controller)
);
doctorManagementRouter.delete(
  "/:id/reject",
  authMiddleware,
  verifyRole("admin"),
  controller.rejectDoctor.bind(controller)
);
doctorManagementRouter.get(
  "/:id/appointments",
  authMiddleware,
  verifyRole("admin"),
  controller.getDoctorAppointments.bind(controller)

);
export default doctorManagementRouter