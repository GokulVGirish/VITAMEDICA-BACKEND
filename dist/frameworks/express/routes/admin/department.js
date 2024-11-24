"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const department_1 = __importDefault(require("../../../../interface_adapters/controllers/admin/department"));
const adminRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/adminRepository"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const department_2 = __importDefault(require("../../../../use_cases/admin/department"));
const repository = new adminRepository_1.default();
const interactor = new department_2.default(repository);
const controller = new department_1.default(interactor);
const departmentRouter = express_1.default.Router();
departmentRouter.get("/", authentication_1.default, (0, role_Authenticate_1.default)("admin"), controller.getDepartments.bind(controller));
departmentRouter.post("/", authentication_1.default, (0, role_Authenticate_1.default)("admin"), controller.addDepartment.bind(controller));
departmentRouter.delete("/:id", authentication_1.default, (0, role_Authenticate_1.default)("admin"), controller.deleteDepartment.bind(controller));
exports.default = departmentRouter;
