import userRouter from "./user/userRouter";
import adminRouter from "./admin/adminRouter";
import doctorRouter from "./doctor/doctorRouter";
import { Application } from "express";

const routes:Function=(app:Application)=>{
    app.use("/api/users",userRouter)
    app.use("/api/admin",adminRouter)
    app.use("/api/doctors", doctorRouter);
   

}
export default routes