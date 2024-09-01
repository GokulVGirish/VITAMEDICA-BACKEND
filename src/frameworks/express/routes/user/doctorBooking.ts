import express from "express";
import DoctorSearchBookingControllers from "../../../../interface_adapters/controllers/user/doctorBooking";
import UserRepository from "../../../../interface_adapters/repositories/userRepository";
import authMiddleware from "../../middlewares/jwt-verify";
import { getUser } from "../../middlewares/user";
import verifyRole from "../../middlewares/role-Authenticate";
import DoctorBookingInteractor from "../../../../use_cases/user/doctorBooking";
import AwsS3 from "../../../services/awsS3";

const respository = new UserRepository();
const awsS3=new AwsS3()
const interactor = new DoctorBookingInteractor(respository,awsS3);
const controller = new DoctorSearchBookingControllers(interactor);
const doctorSearchBookingRouter = express.Router();
doctorSearchBookingRouter.get(
  "/list",
  controller.getDoctorList.bind(controller)
);
doctorSearchBookingRouter.get("/category",controller.getDoctorsByDepartment.bind(controller));
doctorSearchBookingRouter.get(
  "/search",
  controller.getDoctorBySearch.bind(controller)
);
doctorSearchBookingRouter.get(
  "/:id/profile",
  controller.getDoctorPage.bind(controller)
);
doctorSearchBookingRouter.get("/:id/profile/reviews",controller.fetchMoreReviews.bind(controller))
doctorSearchBookingRouter.get(
  "/:doctorId/availability",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.getAvailableDate.bind(controller)
);
doctorSearchBookingRouter.get(
  "/:doctorId/slots",
  authMiddleware,
  verifyRole("user"),
  getUser,
  controller.getTimeSlots.bind(controller)
);
doctorSearchBookingRouter.get("/favorites",authMiddleware,verifyRole("user"),getUser,controller.fetchFavoriteDoctors.bind(controller))
doctorSearchBookingRouter.delete("/favorites/:id",authMiddleware,verifyRole("user"),getUser,controller.removeDoctorFavorites.bind(controller));
doctorSearchBookingRouter.post("/favorites/:id",authMiddleware,verifyRole("user"),getUser,controller.addDoctorFavorites.bind(controller))
doctorSearchBookingRouter.get("/favorites/list",authMiddleware,verifyRole("user"),getUser,controller.favoriteDoctorsList.bind(controller))


export default doctorSearchBookingRouter
