import IAdminAppointmentsInteractor from "../../../entities/iuse_cases/admin/iAppointments";
import { Request, Response, NextFunction } from "express";



class AdminAppointmentsControllers {

    constructor(private Interactor:IAdminAppointmentsInteractor){}

    async fetchAppointmentList(req:Request,res:Response,next:NextFunction){
        try{
            const page = parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||10
            const response=await this.Interactor.fetchAppointments(page,limit)
            if(response.success) return res.status(200).json({success:true,message:response.message,data:response.data})
                return res.status(500).json({success:false,message:"Something Went Wrong"})

        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async fetchAppointmentDetail(req:Request,res:Response,next:NextFunction){
        try{
            const id=req.params.id
            const response=await this.Interactor.fetchAppointmentDetail(id)
             if (response.success)
               return res
                 .status(200)
                 .json({
                   success: true,
                   message: response.message,
                   data: response.data,
                 });
             return res
               .status(500)
               .json({ success: false, message: "Something Went Wrong" });

        }
        catch(error){
            console.log(error)
            next(error)
        }

    }

}
export default AdminAppointmentsControllers