"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/adminRepository"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const userManagement_1 = __importDefault(require("../../../../interface_adapters/controllers/admin/userManagement"));
const userManagement_2 = __importDefault(require("../../../../use_cases/admin/userManagement"));
const repository = new adminRepository_1.default();
const interactor = new userManagement_2.default(repository);
const controller = new userManagement_1.default(interactor);
const userManagementRouter = express_1.default.Router();
userManagementRouter.get("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getUsers.bind(controller));
userManagementRouter.put("/:id/:status", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.blockUnblockUser.bind(controller));
userManagementRouter.get("/:id/profile", jwt_verify_1.default, (0, role_Authenticate_1.default)("admin"), controller.getUserProfile.bind(controller));
exports.default = userManagementRouter;
