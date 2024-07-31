import express from "express"
import AdminInteractor from "../../../use_cases/adminInteractor"
import AdminRepository from "../../../interface_adapters/repositories/adminRepository"
import AdminController from "../../../interface_adapters/controllers/admin-controller"
import JwtService from "../../services/jwt-generate"
import authMiddleware from "../../services/jwt-verify"
import verifyRole from "../middlewares/role-Authenticate"



const jwtservices=new JwtService(process.env.ACCESS_TOCKEN_SECRET as string,process.env.REFRESH_TOCKEN_SECRET as string)
const repository=new AdminRepository()
const interactor=new AdminInteractor(repository,jwtservices)
const controller=new AdminController(interactor)
const adminRouter=express.Router()
adminRouter.post("/login",controller.login.bind(controller))
adminRouter.get("/verify-token",authMiddleware,verifyRole("admin"),controller.verifyToken.bind(controller))
adminRouter.get("/department",authMiddleware,verifyRole("admin"),controller.getDepartments.bind(controller))
adminRouter.post("/department",authMiddleware,verifyRole("admin"),controller.addDepartment.bind(controller))
adminRouter.delete("/department/:id",authMiddleware,verifyRole("admin"),controller.deleteDepartment.bind(controller));
adminRouter.get("/userManagement",authMiddleware,verifyRole("admin"),controller.getUsers.bind(controller))
adminRouter.put("/userBlockUnblock/:id/:status",authMiddleware,verifyRole("admin"),controller.blockUnblockUser.bind(controller));
adminRouter.get("/unverifiedDoctor", authMiddleware, verifyRole("admin"),controller.getUnverifiedDoctors.bind(controller));
adminRouter.get("/doctorDocument/:id", authMiddleware,verifyRole("admin"),controller.getDoctorDocs.bind(controller));
adminRouter.put("/verifyDoctor/:id",authMiddleware,verifyRole("admin"),controller.verifyDoctor.bind(controller))
adminRouter.get("/doctorManagement",authMiddleware,verifyRole("admin"),controller.getDoctors.bind(controller));
adminRouter.put("/doctorBlockUnblock/:id/:status",authMiddleware,verifyRole("admin"),controller.doctorBlockUnblock.bind(controller));
 export default adminRouter