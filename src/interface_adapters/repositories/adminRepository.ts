import { nextTick } from "process"
import IAdminRepository from "../../entities/irepositories/iAdminRepository"
import { MongoAdmin } from "../../entities/rules/admin"
import MongoDepartment from "../../entities/rules/departments"
import { MongoDoctor } from "../../entities/rules/doctor"
import { MongoUser } from "../../entities/rules/user"
import adminModel from "../../frameworks/mongoose/models/AdminSchema"
import departmentModel from "../../frameworks/mongoose/models/departmentSchema"
import doctorModel from "../../frameworks/mongoose/models/DoctorSchema"
import userModel from "../../frameworks/mongoose/models/UserSchema"
import rejectedDoctorModel from "../../frameworks/mongoose/models/RejectedDoctor"

class AdminRepository implements IAdminRepository{
   


   async getAdmin(email: string): Promise<MongoAdmin | null> {
    const admin=await adminModel.findOne({email:email})
    return admin
       
   }
   async getDepartments(): Promise<{ status: boolean; departments?: MongoDepartment[]; }> {
       try{
         const departments=await departmentModel.find()
         if(departments){
            return {status:true,departments:departments}
         }else{
            return {
               status:false
            }
         }

       }
       catch(error){
         console.log(error)
         throw error
       }
   }
   async addDepartment(name: string): Promise<{ status: boolean; department?: MongoDepartment; }> {
       try{
         const department=await departmentModel.create({name:name})
         if(!department){
            return {status:false}
         }
         return {status:true,department}

       }
       catch(error){
         console.log(error)
         throw error
       }
   }
   async deleteDepartment(id: string): Promise<{ status: boolean; message?: string; }> {
       try{
         const result=await departmentModel.deleteOne({_id:id})
           if (result.deletedCount === 1) {
             return {
               status: true,
               message: "Department deleted successfully",
             };
           } else {
             return {
               status: false,
               message: "Department not found or could not be deleted",
             };
           }

       }
       catch(error){
         console.log(error)
         throw error
       }
   }
   async getUsers(): Promise<{ status: boolean; message: string; users?: MongoUser[]; }> {
       try{
         const users=await userModel.find()
         if(!users){
            return {status:false,message:"error retriving users"}
         }
         return {status:true,message:"sucessful",users}

       }
       catch(error){
         console.log(error)
         throw error
       }
   }
   async blockUnblockUser(id: string,status:boolean): Promise<boolean> {
       try{
         const result=await userModel.updateOne({_id:id},{$set:{isBlocked:status}})
         
            return result.modifiedCount > 0


       }
       catch(error){
         console.log(error)
         throw error

       }
   }
   async getUnverifiedDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[]; }> {
       try{
       const result = await doctorModel.aggregate([
         {
           $match: {
             documentsUploaded: true,
             status: "Submitted",
           },
         },
         {
           $lookup: {
             from: "departments", // The name of the department collection
             localField: "department",
             foreignField: "_id",
             as: "department",
           },
         },
         {
           $unwind: {
             path: "$department",
             preserveNullAndEmptyArrays: true, 
           },
         },
       ]);

       return { status: true, doctors: result };

       }
       catch(error){
         console.log(error)
         throw error
       }
   }
   async getDoctor(id: string): Promise<{ status: boolean; doctor?: MongoDoctor; }> {
       try{
        const result = await doctorModel
          .findOne({ _id: id })
          .populate("department")
        if (result) {
          return { status: true, doctor: result };
        } else {
          return { status: false };
        }

       }
       catch(error){
         throw error
       }
   }
   async verifyDoctor(id: string): Promise<boolean> {
       try{
         const result=await doctorModel.updateOne({_id:id},{$set:{status:"Verified"}})
       return result.modifiedCount>0

       }
       catch(error){
         throw error
       }
   }
   async getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[]; }> {
       try{
         const doctors=await doctorModel.find({status:"Verified"})
         if(doctors){
            return {status:true,doctors:doctors}
         }else{
            return {status:false}
         }

       }
       catch(error){
         throw error
       }
   }
   async blockUnblockDoctor(id: string, status: boolean): Promise<boolean> {
       try{
         const result = await doctorModel.updateOne(
           { _id: id },
           { $set: { isBlocked:status } }
         );
          return result.modifiedCount > 0;


       }
       catch(error){
         throw error
       }
   }
   async deleteDoctor(id: string): Promise<boolean> {
       try{
        const result=await doctorModel.deleteOne({_id:id})
        return result.deletedCount===1

       }
       catch(error){
        throw error
       }
   }
   async createRejectedDoctor(email: string, reason: string): Promise<boolean> {
       try{
        const result=await rejectedDoctorModel.create({
          email:email,
          reason:reason
        })
        return result?true:false


       }
       catch(error){
        throw error
       }
   }
}
export default AdminRepository