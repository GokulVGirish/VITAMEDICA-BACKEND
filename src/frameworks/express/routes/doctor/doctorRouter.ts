import express from "express"
import authRouter from "./auth"
import profileRouter from "./profile"
import appointmentRouter from "./appointment"
import slotRouter from "./slot"
import walletRouter from "./wallet"
import doctorUtilitiesRouter from "./doctorUtilities"
const doctorRouter=express.Router()

doctorRouter.use("/auth",authRouter)
doctorRouter.use("/profile",profileRouter)
doctorRouter.use("/appointments",appointmentRouter)
doctorRouter.use("/slots",slotRouter)
doctorRouter.use("/wallet",walletRouter)
doctorRouter.use("/utility",doctorUtilitiesRouter)

export default doctorRouter