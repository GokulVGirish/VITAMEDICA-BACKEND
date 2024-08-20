"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const department_1 = __importDefault(require("../../../../interface_adapters/controllers/admin/department"));
const adminInteractor_1 = __importDefault(require("../../../../use_cases/adminInteractor"));
const adminRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/adminRepository"));
const jwt_generate_1 = __importDefault(require("../../../services/jwt-generate"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const jwtservices = new jwt_generate_1.default(process.env.ACCESS_TOCKEN_SECRET, process.env.REFRESH_TOCKEN_SECRET);
const repository = new adminRepository_1.default();
const interactor = new adminInteractor_1.default(repository, jwtservices);
const controller = new department_1.default(interactor);
const departmentRouter = express_1.default.Router();
departmentRouter.get("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getDepartments.bind(controller));
departmentRouter.post("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.addDepartment.bind(controller));
departmentRouter.delete("/:id", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.deleteDepartment.bind(controller));
exports.default = departmentRouter;
