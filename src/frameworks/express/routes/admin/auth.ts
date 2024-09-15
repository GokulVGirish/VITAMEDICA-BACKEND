import express from "express"
import AdminAuthControllers from "../../../../interface_adapters/controllers/admin/auth";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminAuthInteractor from "../../../../use_cases/admin/auth";


const jwtservices = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const repository = new AdminRepository();
const interactor = new AdminAuthInteractor(repository, jwtservices);
const controller = new AdminAuthControllers(interactor);
const authRouter = express.Router();
authRouter.post("/login", controller.login.bind(controller));
authRouter.get(
  "/token/verify-token",
  authMiddleware,
  verifyRole("admin"),
  controller.verifyToken.bind(controller)
);
export default authRouter


