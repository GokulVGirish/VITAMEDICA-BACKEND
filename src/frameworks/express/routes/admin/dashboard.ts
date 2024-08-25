import express from "express";
import AdminDashboardControllers from "../../../../interface_adapters/controllers/admin/dash";
import AdminInteractor from "../../../../use_cases/adminInteractor";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import JwtService from "../../../services/jwt-generate";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import authRouter from "./auth";

const jwtservices = new JwtService(
  process.env.ACCESS_TOCKEN_SECRET as string,
  process.env.REFRESH_TOCKEN_SECRET as string
);
const repository = new AdminRepository();
const interactor = new AdminInteractor(repository, jwtservices);
const controller = new AdminDashboardControllers(interactor);
const dashRouter = express.Router();
dashRouter.get('/today',authMiddleware,verifyRole("admin"),controller.getCurrentDayReport.bind(controller))
dashRouter.get("/weekly", authMiddleware, verifyRole("admin"),controller.getWeeklyReport.bind(controller));
dashRouter.get("/monthly", authMiddleware, verifyRole("admin"),controller.getMonthlyReport.bind(controller));
dashRouter.get("/yearly",authMiddleware,verifyRole("admin"),controller.getYearlyReport.bind(controller))


export default dashRouter