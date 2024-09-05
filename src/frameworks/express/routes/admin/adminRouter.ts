import express from "express"
import authRouter from "./auth"
import departmentRouter from "./department"
import userManagementRouter from "./userManagement"
import doctorManagementRouter from "./doctorManagement"
import dashRouter from "./dashboard"
import appointmentRouter from "./appointment"
import payoutRouter from "./payouts"


const adminRouter=express.Router()
adminRouter.use("/auth",authRouter)
adminRouter.use("/departments",departmentRouter)
adminRouter.use("/users",userManagementRouter)
adminRouter.use("/doctors",doctorManagementRouter)
adminRouter.use("/dashboard",dashRouter)
adminRouter.use("/appointments",appointmentRouter)
adminRouter.use("/payouts",payoutRouter)


export default adminRouter