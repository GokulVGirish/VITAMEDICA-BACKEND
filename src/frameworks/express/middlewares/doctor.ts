import { Request, RequestHandler } from "express";
import { CustomRequestType } from "./role-Authenticate";
import doctorModel from "../../mongoose/models/DoctorSchema";
import { MongoDoctor } from "../../../entities/rules/doctor";
export interface doctorDataRequest extends Request{
    doctorData:MongoDoctor
}



export const getDoctor:RequestHandler=async(req,res,next)=>{
    try{
        const {emailId}=(req as CustomRequestType).user
        const doctor=await doctorModel.findOne({email:emailId})
       if (!doctor)
         return res.status(401).json({ message: "Un authorized access" });
          if (doctor.isBlocked)
            return res.status(401).json({ message: "Sorry User Blocked" });
          (req as doctorDataRequest).doctorData = doctor;
          next();



    }
    catch(error){

    }
}