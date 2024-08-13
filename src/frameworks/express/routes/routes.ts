import userRouter from "./user-router";
import adminRouter from "./admin-router";
import doctorRouter from "./doctor-router";
import { Application } from "express";

const routes:Function=(app:Application)=>{
    app.use("/api/users",userRouter)
    app.use("/admin",adminRouter)
    app.use("/doctor",doctorRouter)

}
export default routes