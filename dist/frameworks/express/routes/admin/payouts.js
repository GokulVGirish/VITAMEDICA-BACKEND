"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payouts_1 = __importDefault(require("../../../../interface_adapters/controllers/admin/payouts"));
const payouts_2 = __importDefault(require("../../../../use_cases/admin/payouts"));
const adminRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/adminRepository"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const awsS3_1 = __importDefault(require("../../../services/awsS3"));
const repository = new adminRepository_1.default();
const awsS3 = new awsS3_1.default();
const interactor = new payouts_2.default(repository, awsS3);
const controller = new payouts_1.default(interactor);
const payoutRouter = express_1.default.Router();
payoutRouter.get(`/refunds`, authentication_1.default, (0, role_Authenticate_1.default)("admin"), controller.getRefundsList.bind(controller));
payoutRouter.get(`/refunds/:id`, authentication_1.default, (0, role_Authenticate_1.default)("admin"), controller.getRefundDetail.bind(controller));
payoutRouter.get("/withdrawals", authentication_1.default, (0, role_Authenticate_1.default)("admin"), controller.getWithdrawalList.bind(controller));
exports.default = payoutRouter;
