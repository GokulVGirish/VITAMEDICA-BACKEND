"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointments_1 = __importDefault(require("../../../../interface_adapters/controllers/user/appointments"));
const userInteractor_1 = __importDefault(require("../../../../use_cases/userInteractor"));
const userRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/userRepository"));
const mailer_1 = __importDefault(require("../../../services/mailer"));
const jwt_generate_1 = __importDefault(require("../../../services/jwt-generate"));
const jwt_verify_1 = __importDefault(require("../../middlewares/jwt-verify"));
const user_1 = require("../../middlewares/user");
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const respository = new userRepository_1.default();
const mailer = new mailer_1.default();
const jwtservices = new jwt_generate_1.default(process.env.ACCESS_TOCKEN_SECRET, process.env.REFRESH_TOCKEN_SECRET);
const interactor = new userInteractor_1.default(respository, mailer, jwtservices);
const controller = new appointments_1.default(interactor);
const appointmentRouter = express_1.default.Router();
appointmentRouter.post("/order", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.razorPayOrder.bind(controller));
appointmentRouter.post("/order/validate", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.razorPayValidate.bind(controller));
appointmentRouter.post("/lock-slot", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.lockSlot.bind(controller));
appointmentRouter.get("/", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getAppointments.bind(controller));
appointmentRouter.put("/:appointmentId/cancel", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.cancelAppointment.bind(controller));
appointmentRouter.put(`/:appointmentId/review`, jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.addReview.bind(controller));
appointmentRouter.get("/:appointmentId/detail", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getAppointmentDetail.bind(controller));
exports.default = appointmentRouter;
