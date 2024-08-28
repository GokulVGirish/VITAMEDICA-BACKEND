"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorManagement_1 = __importDefault(require("../../../../interface_adapters/controllers/admin/doctorManagement"));
const adminRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/adminRepository"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const doctorManagement_2 = __importDefault(require("../../../../use_cases/admin/doctorManagement"));
const awsS3_1 = __importDefault(require("../../../services/awsS3"));
const awsS3 = new awsS3_1.default();
const repository = new adminRepository_1.default();
const interactor = new doctorManagement_2.default(repository, awsS3);
const controller = new doctorManagement_1.default(interactor);
const doctorManagementRouter = express_1.default.Router();
doctorManagementRouter.get("/unverified", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getUnverifiedDoctors.bind(controller));
doctorManagementRouter.get("/:id/documents", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getDoctorDocs.bind(controller));
doctorManagementRouter.put("/:id/verify", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.verifyDoctor.bind(controller));
doctorManagementRouter.get("/:id/profile", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getDoctorProfile.bind(controller));
doctorManagementRouter.get("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getDoctors.bind(controller));
doctorManagementRouter.put("/:id/:status", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.doctorBlockUnblock.bind(controller));
doctorManagementRouter.delete("/:id/reject", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.rejectDoctor.bind(controller));
exports.default = doctorManagementRouter;
