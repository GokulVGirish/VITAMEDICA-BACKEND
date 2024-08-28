import express from "express"

import authRouter from "./auth"
import profileRouter from "./profile"
import doctorSearchBookingRouter from "./doctorBooking"
import appointmentRouter from "./appointments"
import walletRouter from "./wallet"

const userRouter=express.Router()

userRouter.use("/auth", authRouter);
userRouter.use("/profile", profileRouter);
userRouter.use("/doctors", doctorSearchBookingRouter);
userRouter.use("/appointments", appointmentRouter);
userRouter.use("/wallet", walletRouter);

export default userRouter

