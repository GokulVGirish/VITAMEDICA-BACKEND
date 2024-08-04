import { MongoDoctor, OtpDoctor } from "../rules/doctor";
import MongoDepartment from "../rules/departments";
import { MulterFile } from "../rules/multerFile";
import { promises } from "dns";
import { ObjectId, Types } from "mongoose";
export interface IDoctorInteractor {
  otpSignup(doctor: OtpDoctor): Promise<{
    status: true | false;
    message?: string;
    token?: string;
    errorCode?: string;
  }>;
  verifyOtpSignup(otp: string): Promise<{
    status: true | false;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
     doctor?:string,
    docstatus?:string
  }>;
  login(
    email: string,
    password: string
  ): Promise<{
    status: true | false;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    errorCode?: string;
    doctor?: string;
    doctorStatus?: string;
  }>;
  uploadFileToS3(
    bucketName: string,
    key: string,
    file: MulterFile
  ): Promise<void>;
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  documentsUpload(
    docId: string,
    file1: MulterFile,
    file2: MulterFile,
    file3: MulterFile,
    file4: MulterFile
  ): Promise<{ status: boolean }>;
   resendOtp(email:string):Promise<{status:boolean,message?:string,errorCode?:string}>
   getProfile(image:string):Promise<{url:string|null}>
     profileUpdate(
    data: any,
    userId:Types.ObjectId,
    email:string
  ): Promise<{ status: boolean; message: string; errorCode?: string,data?:MongoDoctor }>;
   updateProfileImage(id:Types.ObjectId,image:MulterFile):Promise<{status:boolean;imageData?:string}>

 
}
