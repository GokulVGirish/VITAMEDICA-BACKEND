import express from "express";
import AdminDepartmentControllers from "../../../../interface_adapters/controllers/admin/department";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminDepartmentInteractor from "../../../../use_cases/admin/department";


const repository = new AdminRepository();
const interactor = new AdminDepartmentInteractor(repository);
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
