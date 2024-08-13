import { IDoctorInteractor } from "../entities/iuse_cases/iDoctorInteractor";
import { IDoctorRepository } from "../entities/irepositories/idoctorRepository";
import { MongoDoctor, OtpDoctor } from "../entities/rules/doctor";
import { IMailer } from "../entities/services/mailer";
import { IJwtService } from "../entities/services/jwtServices";
import MongoDepartment from "../entities/rules/departments";
import bcrypt from "bcryptjs";
import { MulterFile } from "../entities/rules/multerFile";
import { S3Client ,PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
import s3Config from "../entities/services/awsS3";
import { ObjectId, Types } from "mongoose";
import { DoctorSlots } from "../entities/rules/slotsType";
import { IDoctorWallet } from "../entities/rules/doctorWalletType";
import IAppointment from "../entities/rules/appointments";

const s3 = new S3Client({
  region: s3Config.BUCKET_REGION,
  credentials: {
    accessKeyId: s3Config.ACCESS_KEY,
    secretAccessKey: s3Config.SECRET_KEY,
  },
});

class DoctorInteractor implements IDoctorInteractor {
  constructor(
    private readonly Repository: IDoctorRepository,
    private readonly Mailer: IMailer,
    private readonly JWTServices: IJwtService
  ) {}
  async otpSignup(doctor: OtpDoctor): Promise<{
    status: true | false;
    message?: string;
    token?: string;
    errorCode?: string;
  }> {
    try {
      const exists = await this.Repository.doctorExists(doctor.email);
      if (!exists) {
        const mailResponse = await this.Mailer.sendMail(doctor.email);
        if (mailResponse.success) {
          doctor.otp = mailResponse.otp;
          doctor.password = await bcrypt.hash(doctor.password, 10);
          const response = await this.Repository.tempOtpDoctor(doctor);
          const tempToken = this.JWTServices.generateToken(
            { emailId: doctor.email, role: "doctor", verified: false },
            { expiresIn: "10m" }
          );
          return {
            status: true,
            message: "otp sucessfully sent",
            token: tempToken,
          };
        } else {
          return {
            status: false,
            message: "error sending email",
            errorCode: "EMAIL_SEND_FAILURE",
          };
        }
      } else {
        return {
          status: false,
          message: "doctor already exist",
          errorCode: "DOCTOR_EXISTS",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyOtpSignup(
    otp: string
  ): Promise<{
    status: true | false;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    doctor?:string,
    docstatus?:string

  }> {
    try {
      const response = await this.Repository.createDoctorOtp(otp);
      if (response.status && response.doctor) {
        const accessToken = this.JWTServices.generateToken(
          { emailId: response.doctor.email, role: "doctor", verified: true },
          { expiresIn: "1h" }
        );
        const refreshToken = this.JWTServices.generateRefreshToken(
          { emailId: response.doctor.email, role: "doctor", verified: true },
          { expiresIn: "1d" }
        );
        return {
          status: true,
          message: "signed Up Sucessfully",
          accessToken,
          refreshToken,
          doctor:response.doctor?.name,docstatus:response.doctor?.status
        };
      } else {
        return { status: false, message: response.message };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async login(
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
  }> {
    try {
      const rejectDoctor=await this.Repository.getRejectedDoctor(email)
      if(rejectDoctor)return {status:false,message:rejectDoctor.reason,errorCode:"VERIFICATION_FAILED"}
      const doctor = await this.Repository.getDoctor(email);
      if (!doctor) {
        return {
          status: false,
          message: "invalid doctor",
          errorCode: "INVALID_DOCTOR",
        };
      }
       if (doctor.isBlocked)
         return { status: false, message: "Sorry User Blocked" };
      const hashedPassword = doctor.password;
      const match = await bcrypt.compare(password, hashedPassword);
      if (!match) {
        return {
          status: false,
          message: "invalid password",
          errorCode: "INVALID_Password",
        };
      }
      const accessToken = this.JWTServices.generateToken(
        { emailId: doctor.email, role: "doctor", verified: true },
        { expiresIn: "1h" }
      );
      const refreshToken = this.JWTServices.generateRefreshToken(
        { emailId: doctor.email, role: "doctor", verified: true },
        { expiresIn: "1d" }
      );

      return {
        status: true,
        message: "logged in sucessfully",
        accessToken,
        refreshToken,
        doctor: doctor.name,
        doctorStatus: doctor.status,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }> {
    try {
      const response = await this.Repository.getDepartments();
      if (response.status) {
        return { status: true, departments: response.departments };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }



  async documentsUpload(docId:string,file1: MulterFile, file2: MulterFile, file3: MulterFile, file4: MulterFile): Promise<{ status: boolean; }> {
      try{
        const bucketName=s3Config.BUCKET_NAME

        const folderName = `doctorDocs/${docId}-doc`;
        const certificateImageKey = `${folderName}/certificateImage-${docId}.${
          file1.mimetype.split("/")[1]
        }`;
        const qualificationImageKey = `${folderName}/qualificationImage-${docId}.${
          file2.mimetype.split("/")[1]
        }`;
        const aadharFrontKey = `${folderName}/aadharFront-${docId}.${
          file3.mimetype.split("/")[1]
        }`;
        const aadharBackKey = `${folderName}/aadharBack-${docId}.${
          file4.mimetype.split("/")[1]
        }`;
         await this.uploadFileToS3(bucketName, certificateImageKey, file1);
         await this.uploadFileToS3(bucketName, qualificationImageKey, file2);
         await this.uploadFileToS3(bucketName, aadharFrontKey, file3);
         await this.uploadFileToS3(bucketName, aadharBackKey, file4);
         await this.Repository.documentsUpdate(docId,certificateImageKey,qualificationImageKey,aadharFrontKey,aadharBackKey)
         await this.Repository.docStatusChange(docId,"Submitted")
         return {status:true}
        

      }
      catch(error){
        console.log(error)
        throw error
      }
  }
      async uploadFileToS3(bucketName: string, key: string, file: MulterFile): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

     await s3.send(command);
   }
   async resendOtp(email: string): Promise<{ status: boolean; message?: string; errorCode?: string; }> {
       try{
         const mailResponse = await this.Mailer.sendMail(email);
         if (!mailResponse.success) {
           return { status: false, message: "error sending email" };
         }
         const otp = mailResponse.otp;
         const response = await this.Repository.resendOtp(otp, email);
         if (response) {
           return { status: true, message: "otp sucessfully sent" };
         } else {
           return { status: false, message: "retry signup" };
         }

       }
       catch(error){
        throw error

       }
   }
   async getProfile(image: string): Promise<{ url: string | null; }> {
       try{
        if(image){
          const command=new GetObjectCommand({
            Bucket:s3Config.BUCKET_NAME,
            Key:image
          })
          const url = await getSignedUrl(s3, command, {
            expiresIn: 3600,
          });
          return {url:url}

        }else{
          return {url:null}
        }


       }
       catch(error){
        throw error
       }
   }
   async updateProfileImage(id: Types.ObjectId, image: MulterFile): Promise<{ status: boolean; imageData?: string; }> {
       try{
          const folderPath = "doctors";
          const fileExtension = image.originalname.split(".").pop();
          const uniqueFileName = `profile-${id}.${fileExtension}`;
          const key = `${folderPath}/${uniqueFileName}`;
        const command = new PutObjectCommand({
         Bucket:s3Config.BUCKET_NAME,
         Key:key,
         Body:image.buffer,
         ContentType:image.mimetype

        });
        await s3.send(command)
        const response=await this.Repository.updateProfileImage(id,key)
       
        const command2=new GetObjectCommand({
          Bucket:s3Config.BUCKET_NAME,
          Key:key
        })
         const url = await getSignedUrl(s3, command2, {
           expiresIn: 3600,
         });
         return {status:true,imageData:url}

    }
       catch(error){
        console.log(error)
        throw error
       }
   }
   async profileUpdate(data: any, userId: Types.ObjectId, email: string): Promise<{ status: boolean; message: string; errorCode?: string; data?: MongoDoctor; }> {
       try{
        const response=await this.Repository.profileUpdate(userId,{name:data.name,phone:data.phone,description:data.description,fees:data.fees,degree:data.degree})
        if(!response)return {status:false,message:"internal server error"}
        const result=await this.Repository.getDoctor(email)
      if(result){
          return { status: true, data: result,message:"Profile sucessfully Updated" };
      }else{
        return { status: false, message: "internal server error" };

      }

       }
       catch(error){
        throw error

       }
   }
   async addSlots(id: Types.ObjectId, data: DoctorSlots): Promise<{ status: boolean; message: string; errorCode?: string; }> {
       
    try{
      const exist=await this.Repository.getSlot(data.date,id)
      if(exist)return {status:false,message:"Slot For this Day Already exist"}
      const response=await this.Repository.createSlot(id,data)
      if(!response)return {status:false,message:"Something Went Wrong"}
       return {status:true,message:"Slot Added Sucessfully"}
      

    }
    catch(error){
      throw error
    }
   }
   async getWalletDetails(page: number, limit: number, docId: Types.ObjectId): Promise<{ status: boolean; doctorWallet?: IDoctorWallet; message: string;totalPages?:number }> {
       try{
        const response=await this.Repository.getWalletDetails(page,limit,docId)
        if(!response.status) return {status:false,message:"No wallet Found"}
        return {status:true,message:"Sucessful",doctorWallet:response.doctorWallet,totalPages:response.totalPages}

       }
       catch(error){
        throw error
       }
   }
   async getTodaysAppointments(docId: Types.ObjectId): Promise<{ status: boolean; message: string; appointments?: IAppointment[]; }> {
       
    try{
      const response=await this.Repository.getTodaysAppointments(docId)
      if(response){
        return {status:true,message:"Success",appointments:response}
      }
      return {status:false,message:"no appointments"}

    }
    catch(error){
      throw error
    }
   }
   async getUpcommingAppointments(docId: Types.ObjectId,page:number,limit:number): Promise<{ status: boolean; message: string; appointments?: IAppointment[];totalPages?:number }> {
       
    try{
      const response=await this.Repository.getUpcommingAppointments(docId,page,limit)
      if(!response.status) return {status:false,message:"no appointments"}
      return {status:true,message:"success",appointments:response.appointments,totalPages:response.totalPages}

    }
    catch(error){
      throw error
    }
   }
   async getAvailableDate(id: Types.ObjectId): Promise<{ status: boolean; message: string; dates?: string[]; }> {
       try{
        const response=await this.Repository.getAvailableDate(id)
        if (!response) return { status: false, message: "no available slots" };
        const dates = [
          ...new Set(
            response.map((slot) => slot.date.toISOString().split("T")[0])
          ),
        ];
        return { status: true, message: "Success", dates: dates };


       }
       catch(error){
        throw error
       }
   }
   async getTimeSlots(id: Types.ObjectId, date: string): Promise<{ status: boolean; message: string; slots?: DoctorSlots; }> {
       try{
           const result = await this.Repository.getTimeSlots(id, date);
        
           if (!result)
             return { status: false, message: "Something went wrong" };
           return { status: true, message: "Success", slots: result };

       }
       catch(error){
        throw error
       }
   }
   async deleteUnbookedSlots(id: Types.ObjectId, date: Date, startTime:Date): Promise<{ status: boolean; message: string; }> {
       try{

        const response=await this.Repository.deleteSlots(id,date,startTime)
        if(response)return {status:true,message:"Sucessfully Cancelled"}
        return {status:false,message:"Something Went wrong"}

       }
       catch(error){
        throw error
       }
   }
   async deleteBookedTimeSlots(id: Types.ObjectId, date: Date,startTime:Date): Promise<{ status: boolean; message: string; }> {
       try{

        const result=await this.Repository.cancelAppointment(id,date,startTime)
        if(!result.status) return {status:false,message:"Something Went Wrong"}
        const  res=await this.Repository.createCancelledAppointment(id,result.id as Types.ObjectId,result.amount as string,"doctor")
        if(!res) return {status:false,message:"Something Went Wrong"}
        const response=await this.Repository.doctorWalletUpdate(id,result.id as Types.ObjectId,result.amount as string,"debit","appointment cancelled by Doc","razorpay")
        if(!response)return { status: false, message: "Something Went Wrong" };

      const userwaller=await this.Repository.userWalletUpdate(result.userId as Types.ObjectId,result.id as Types.ObjectId,result.amount as string,"credit","Appointment cancelled by doctor","razorpay")
      if(!userwaller) return { status: false, message: "Something Went Wrong" };
      const deleteSlot=await this.Repository.deleteSlots(id,date,startTime)
      if(!deleteSlot) return { status: false, message: "Something Went Wrong" };

      return {status:true,message:"sucessfully done"}


       }
       catch(error){
        throw error
       }
   }

}
export default DoctorInteractor;
