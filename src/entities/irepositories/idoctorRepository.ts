import { MongoDoctor, OtpDoctor } from "../rules/doctor"
import MongoDepartment from "../rules/departments";

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
}