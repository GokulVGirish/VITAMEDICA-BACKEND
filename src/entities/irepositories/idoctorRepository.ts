import { MongoDoctor, OtpDoctor } from "../rules/doctor"
import MongoDepartment from "../rules/departments";
import { ObjectId, Types } from "mongoose";
import { RejectedDoctor } from "../rules/rejectedDoctor";
import { DoctorSlots } from "../rules/slotsType";

export interface IDoctorRepository {
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  tempOtpDoctor(data: OtpDoctor): Promise<{ status: true | false }>;
  doctorExists(email: string): Promise<null | MongoDoctor>;
  createDoctorOtp(
    otp: string
  ): Promise<{ status: boolean; message: string; doctor?: MongoDoctor }>;
  getDoctor(email: string): Promise<MongoDoctor | null>;
  docStatusChange(id:string,status: string): Promise<void>;

  documentsUpdate(docId:string,key1:string,key2:string,key3:string,key4:string):Promise<void>
    resendOtp(otp:string,email:string):Promise<boolean>
    updateProfileImage(id:Types.ObjectId,imagePath:string):Promise<boolean>
     profileUpdate(id:Types.ObjectId,data:{name:string,phone:string,description:string,fees:string,degree:string}):Promise<boolean>
     getRejectedDoctor(email:string):Promise<RejectedDoctor|null>
     createSlot(id:Types.ObjectId,data:DoctorSlots):Promise<boolean>
     getSlot(date:Date):Promise<DoctorSlots|null>
}