import userRouter from "./user/userRouter";
import adminRouter from "./admin/adminRouter";
import doctorRouter from "./doctor/doctorRouter";
import { Application } from "express";
import imageUpload from "./imageUpload";

const routes:Function=(app:Application)=>{
    
    app.use("/api/users",userRouter)
    app.use("/api/admin",adminRouter)
    app.use("/api/doctors", doctorRouter);
    app.use("/api/image-upload",imageUpload)
   

}
export default routes