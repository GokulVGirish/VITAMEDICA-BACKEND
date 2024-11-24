import express from "express";
import AdminAuthControllers from "../../../../interface_adapters/controllers/admin/auth";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/authentication";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminAuthInteractor from "../../../../use_cases/admin/auth";
import { loginLimiter } from "../../middlewares/rateLimiter";

const jwtservices = new JwtService(
  process.env.ACCESS_TOKEN_SECRET as string,
  process.env.REFRESH_TOKEN_SECRET as string
);
const repository = new AdminRepository();
const interactor = new AdminAuthInteractor(repository, jwtservices);
const controller = new AdminAuthControllers(interactor);
const authRouter = express.Router();
authRouter.post("/login",loginLimiter, controller.login.bind(controller));
authRouter.get(
  "/token/verify-token",
  authMiddleware,
  verifyRole("admin"),
  controller.verifyToken.bind(controller)
);
authRouter.post(`/logout`, controller.logout.bind(controller));
export default authRouter;
