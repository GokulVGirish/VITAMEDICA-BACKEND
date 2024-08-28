"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dash_1 = __importDefault(require("../../../../interface_adapters/controllers/admin/dash"));
const adminRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/adminRepository"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const dashboard_1 = __importDefault(require("../../../../use_cases/admin/dashboard"));
const repository = new adminRepository_1.default();
const interactor = new dashboard_1.default(repository);
const controller = new dash_1.default(interactor);
const dashRouter = express_1.default.Router();
dashRouter.get('/today', jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getCurrentDayReport.bind(controller));
dashRouter.get("/weekly", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getWeeklyReport.bind(controller));
dashRouter.get("/monthly", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getMonthlyReport.bind(controller));
dashRouter.get("/yearly", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getYearlyReport.bind(controller));
exports.default = dashRouter;