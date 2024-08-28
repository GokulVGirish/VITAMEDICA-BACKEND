"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_1 = __importDefault(require("../../../../interface_adapters/controllers/user/wallet"));
const wallet_2 = __importDefault(require("../../../../use_cases/user/wallet"));
const userRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/userRepository"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const user_1 = require("../../middlewares/user");
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const respository = new userRepository_1.default();
const interactor = new wallet_2.default(respository);
const controller = new wallet_1.default(interactor);
const walletRouter = express_1.default.Router();
walletRouter.get("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getWalletInfo.bind(controller));
exports.default = walletRouter;
