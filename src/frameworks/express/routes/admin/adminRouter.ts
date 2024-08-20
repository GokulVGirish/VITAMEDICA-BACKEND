import express from "express"
import authRouter from "./auth"
import departmentRouter from "./department"
import userManagementRouter from "./userManagement"
import doctorManagementRouter from "./doctorManagement"


const adminRouter=express.Router()
adminRouter.use("/auth",authRouter)
adminRouter.use("/departments",departmentRouter)
adminRouter.use("/users",userManagementRouter)
adminRouter.use("/doctors",doctorManagementRouter)


export default adminRouter