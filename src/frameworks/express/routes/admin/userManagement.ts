import express from "express";
import AdminInteractor from "../../../../use_cases/adminInteractor";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminUserManagementControllers from "../../../../interface_adapters/controllers/admin/userManagement";

const jwtservices = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const repository = new AdminRepository();
const interactor = new AdminInteractor(repository, jwtservices);
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
export default userManagementRouter
