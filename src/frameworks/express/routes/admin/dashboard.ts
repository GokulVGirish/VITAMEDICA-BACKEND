import express from "express";
import AdminDashboardControllers from "../../../../interface_adapters/controllers/admin/dash";
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminDashboardInteractor from "../../../../use_cases/admin/dashboard";



const repository = new AdminRepository();
const interactor = new AdminDashboardInteractor(repository);
const controller = new AdminDashboardControllers(interactor);
const dashRouter = express.Router();
dashRouter.get('/today',authMiddleware,verifyRole("admin"),controller.getCurrentDayReport.bind(controller))
dashRouter.get("/weekly", authMiddleware, verifyRole("admin"),controller.getWeeklyReport.bind(controller));
dashRouter.get("/monthly", authMiddleware, verifyRole("admin"),controller.getMonthlyReport.bind(controller));
dashRouter.get("/yearly",authMiddleware,verifyRole("admin"),controller.getYearlyReport.bind(controller))


export default dashRouter