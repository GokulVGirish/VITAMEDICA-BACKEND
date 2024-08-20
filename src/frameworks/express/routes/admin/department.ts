import express from "express";
import AdminDepartmentControllers from "../../../../interface_adapters/controllers/admin/department";
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
const controller = new AdminDepartmentControllers(interactor);
const departmentRouter = express.Router();
departmentRouter.get(
  "/",
  authMiddleware,
  verifyRole("admin"),
  controller.getDepartments.bind(controller)
);
departmentRouter.post(
  "/",
  authMiddleware,
  verifyRole("admin"),
  controller.addDepartment.bind(controller)
);
departmentRouter.delete(
  "/:id",
  authMiddleware,
  verifyRole("admin"),
  controller.deleteDepartment.bind(controller)
);
export default departmentRouter
