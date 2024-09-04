"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_1 = __importDefault(require("../../../../interface_adapters/controllers/doctor/wallet"));
const doctorRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/doctorRepository"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const doctor_1 = require("../../middlewares/doctor");
const wallet_2 = __importDefault(require("../../../../use_cases/doctor/wallet"));
const repository = new doctorRepository_1.default();
const interactor = new wallet_2.default(repository);
const controller = new wallet_1.default(interactor);
const walletRouter = express_1.default.Router();
walletRouter.get("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("doctor"), doctor_1.getDoctor, controller.getWalletDetails.bind(controller));
walletRouter.post("/withdraw/:amount", jwt_verify_1.default, (0, role_Authenticate_1.default)("doctor"), doctor_1.getDoctor, controller.withdrawFromWallet.bind(controller));
exports.default = walletRouter;
