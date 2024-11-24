import express from "express"
import AdminAppointmentsControllers from "../../../../interface_adapters/controllers/admin/appointments"
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository";
import authMiddleware from "../../middlewares/authentication";
import verifyRole from "../../middlewares/role-Authenticate";
import AdminAppointmentsInteractor from "../../../../use_cases/admin/appointments";
import AwsS3 from "../../../services/awsS3";

const awsS3=new AwsS3()
const repository = new AdminRepository();
const interactor = new AdminAppointmentsInteractor(repository,awsS3);
const controller = new AdminAppointmentsControllers(interactor);
const appointmentRouter=express.Router()

appointmentRouter.get("/",authMiddleware, verifyRole("admin"),controller.fetchAppointmentList.bind(controller));
appointmentRouter.get("/:id",authMiddleware, verifyRole("admin"),controller.fetchAppointmentDetail.bind(controller));




export default appointmentRouter