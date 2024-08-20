import express from "express";
import AdminDoctorManagementControllers from "../../../../interface_adapters/controllers/admin/doctorManagement";
import AdminInteractor from "../../../../use_cases/adminInteractor";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";


const jwtservices = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const repository = new AdminRepository();
const interactor = new AdminInteractor(repository, jwtservices);
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
export default doctorManagementRouter