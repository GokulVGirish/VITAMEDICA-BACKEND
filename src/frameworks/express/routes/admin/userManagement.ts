import express from "express";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import authMiddleware from "../../middlewares/authentication";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminUserManagementControllers from "../../../../interface_adapters/controllers/admin/userManagement";
import AdminUserManagementInteractor from "../../../../use_cases/admin/userManagement";
import AwsS3 from "../../../services/awsS3";
import { markAsUntransferable } from "worker_threads";


const repository = new AdminRepository();
const awsS3=new AwsS3()
const interactor = new AdminUserManagementInteractor(repository,awsS3);
const controller = new AdminUserManagementControllers(interactor);
const userManagementRouter = express.Router();
userManagementRouter.get(
  "/",
  authMiddleware,
  verifyRole("admin"),
  controller.getUsers.bind(controller)
);
userManagementRouter.put(
  "/:id/:status",
  authMiddleware,
  verifyRole("admin"),
  controller.blockUnblockUser.bind(controller)
);
userManagementRouter.get("/:id/profile",authMiddleware,verifyRole("admin"),controller.getUserProfile.bind(controller))
userManagementRouter.get("/:id/appointments",authMiddleware,verifyRole("admin"),controller.getUserAppointments.bind(controller))

export default userManagementRouter
