"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorSearchBooking_1 = __importDefault(require("../../../../interface_adapters/controllers/user/doctorSearchBooking"));
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
const controller = new doctorSearchBooking_1.default(interactor);
const doctorSearchBookingRouter = express_1.default.Router();
doctorSearchBookingRouter.get("/list", controller.getDoctorList.bind(controller));
doctorSearchBookingRouter.get("/category", controller.getDoctorsByDepartment.bind(controller));
doctorSearchBookingRouter.get("/search", controller.getDoctorBySearch.bind(controller));
doctorSearchBookingRouter.get("/:id/profile", controller.getDoctorPage.bind(controller));
doctorSearchBookingRouter.get("/:id/profile/reviews", controller.fetchMoreReviews.bind(controller));
doctorSearchBookingRouter.get("/:doctorId/availability", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getAvailableDate.bind(controller));
doctorSearchBookingRouter.get("/:doctorId/slots", jwt_verify_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getTimeSlots.bind(controller));
exports.default = doctorSearchBookingRouter;
