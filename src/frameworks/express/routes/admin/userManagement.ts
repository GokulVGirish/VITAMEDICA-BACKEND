import express from "express";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminUserManagementControllers from "../../../../interface_adapters/controllers/admin/userManagement";
import AdminUserManagementInteractor from "../../../../use_cases/admin/userManagement";


const repository = new AdminRepository();
const interactor = new AdminUserManagementInteractor(repository);
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
export default userManagementRouter
