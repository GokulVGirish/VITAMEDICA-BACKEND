import { MongoDoctor } from "../rules/doctor";
import { DoctorSlots } from "../rules/slotsType";
import { User } from "../rules/user"
import { MongoUser } from "../rules/user"
import { Types } from "mongoose"

interface IUserRepository {
  tempOtpUser(data: User): Promise<{ status: true | false }>;
  userExist(email: string): Promise<boolean>;
  createUserOtp(otp: string): Promise<{ status: boolean; user?: any }>;
  getUser(email: string): Promise<MongoUser | null>;
  googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{ status: boolean; message: string }>;
  resendOtp(otp: string, email: string): Promise<boolean>;
  updateProfile(id: Types.ObjectId, data: User): Promise<{ success: boolean }>;
  updateProfileImage(id: Types.ObjectId, imagePath: string): Promise<boolean>;
  resetPassword(email:string,password:string):Promise<boolean>
  getDoctors():Promise<MongoDoctor[]|null>
  getDoctor(id:string):Promise<MongoDoctor|null>
  getSlots(id:string):Promise<DoctorSlots[]|null>
    getTimeSlots(id:string,date:string):Promise<DoctorSlots|null>
    lockSlot(userId:Types.ObjectId,docId:Types.ObjectId,date:string,slotId:Types.ObjectId,lockExpiration:Date):Promise<boolean>
    bookSlot(doctorId:Types.ObjectId,userId:Types.ObjectId,slotId:Types.ObjectId,date:string):Promise<boolean>
    createAppointment(userId:Types.ObjectId,docId:Types.ObjectId,date:string,start:string,end:string,fees:string,paymentId:string):Promise<boolean>
}
export default IUserRepository