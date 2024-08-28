import express from "express"
import authRouter from "./auth"
import departmentRouter from "./department"
import userManagementRouter from "./userManagement"
import doctorManagementRouter from "./doctorManagement"
import dashRouter from "./dashboard"
import appointmentRouter from "./appointment"


const adminRouter=express.Router()
adminRouter.use("/auth",authRouter)
adminRouter.use("/departments",departmentRouter)
adminRouter.use("/users",userManagementRouter)
adminRouter.use("/doctors",doctorManagementRouter)
adminRouter.use("/dashboard",dashRouter)
adminRouter.use("/appointments",appointmentRouter)


export default adminRouter