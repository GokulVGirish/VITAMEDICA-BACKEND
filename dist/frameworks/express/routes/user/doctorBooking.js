"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorBooking_1 = __importDefault(require("../../../../interface_adapters/controllers/user/doctorBooking"));
const userRepository_1 = __importDefault(require("../../../../interface_adapters/repositories/userRepository"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const user_1 = require("../../middlewares/user");
const role_Authenticate_1 = __importDefault(require("../../middlewares/role-Authenticate"));
const doctorBooking_2 = __importDefault(require("../../../../use_cases/user/doctorBooking"));
const awsS3_1 = __importDefault(require("../../../services/awsS3"));
const respository = new userRepository_1.default();
const awsS3 = new awsS3_1.default();
const interactor = new doctorBooking_2.default(respository, awsS3);
const controller = new doctorBooking_1.default(interactor);
const doctorSearchBookingRouter = express_1.default.Router();
doctorSearchBookingRouter.get("/list", controller.getDoctorList.bind(controller));
doctorSearchBookingRouter.get("/category", controller.getDoctorsByDepartment.bind(controller));
doctorSearchBookingRouter.get("/search", controller.getDoctorBySearch.bind(controller));
doctorSearchBookingRouter.get("/:id/profile", controller.getDoctorPage.bind(controller));
doctorSearchBookingRouter.get("/:id/profile/reviews", controller.fetchMoreReviews.bind(controller));
doctorSearchBookingRouter.get("/:doctorId/availability", authentication_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getAvailableDate.bind(controller));
doctorSearchBookingRouter.get("/:doctorId/slots", authentication_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.getTimeSlots.bind(controller));
doctorSearchBookingRouter.get("/favorites", authentication_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.fetchFavoriteDoctors.bind(controller));
doctorSearchBookingRouter.delete("/favorites/:id", authentication_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.removeDoctorFavorites.bind(controller));
doctorSearchBookingRouter.post("/favorites/:id", authentication_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.addDoctorFavorites.bind(controller));
doctorSearchBookingRouter.get("/favorites/list", authentication_1.default, (0, role_Authenticate_1.default)("user"), user_1.getUser, controller.favoriteDoctorsList.bind(controller));
exports.default = doctorSearchBookingRouter;
