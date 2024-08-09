import { IUserInteractor } from "../entities/iuse_cases/iuserInteractor";
import IUserRepository from "../entities/irepositories/iuserRepository";
import { MongoUser, User } from "../entities/rules/user";
import { IMailer } from "../entities/services/mailer";
import { IJwtService } from "../entities/services/jwtServices";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import crypto from "crypto"

import { S3Client ,PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
import s3Config from "../entities/services/awsS3";

import { MulterFile } from "../entities/rules/multerFile";
import { ObjectId, Types } from "mongoose";
import { link } from "fs";
import { ResetPasswordToken } from "../entities/rules/resetPassword";
import { MongoDoctor } from "../entities/rules/doctor";
import { DoctorSlots, Slot } from "../entities/rules/slotsType";
import instance from "../frameworks/services/razorpayInstance";
import IAppointment from "../entities/rules/appointments";

const s3=new S3Client({
    region:s3Config.BUCKET_REGION,
    credentials:{
        accessKeyId:s3Config.ACCESS_KEY,
        secretAccessKey:s3Config.SECRET_KEY
    }
})
class UserInteractor implements IUserInteractor {
  constructor(
    private readonly Repository: IUserRepository,
    private readonly Mailer: IMailer,
    private readonly JWTServices: IJwtService
  ) {}

  async otpSignup(
    user: User
  ): Promise<{ status: true | false; message?: string; token?: string }> {
    try {
      const exist = await this.Repository.userExist(user.email);
      if (!exist) {
        const mailResponse = await this.Mailer.sendMail(user.email);
        if (mailResponse.success) {
          user.otp = mailResponse.otp;
          user.password = await bcrypt.hash(user.password, 10);
          const response = await this.Repository.tempOtpUser(user);
          const tempToken = this.JWTServices.generateToken(
            { emailId: user.email, role: "user", verified: false },
            { expiresIn: "10m" }
          );
          return {
            status: response.status,
            message: "otp sucessfully sent",
            token: tempToken,
          };
        } else {
          return { status: false, message: "error sending email" };
        }
      } else {
        return { status: false, message: "user already exist" };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyOtpSignup(
    otp: string
  ): Promise<{ status: boolean; accessToken?: string; refreshToken?: string }> {
    try {
      const response = await this.Repository.createUserOtp(otp);
      if (response.status) {
        const accessToken = this.JWTServices.generateToken(
          { emailId: response.user.email, role: "user", verified: true },
          { expiresIn: "1h" }
        );
        const refreshToken = this.JWTServices.generateRefreshToken(
          { emailId: response.user.email, role: "user", verified: true },
          { expiresIn: "1d" }
        );

        return { status: true, accessToken, refreshToken };
      } else {
        return { status: false };
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
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
  }> {
    try {
      const userExist = await this.Repository.getUser(email);
      if (userExist?.register === "Google") {
        return {
          status: false,
          message: "Use Google Login",
        };
      }
      if (userExist) {
        const hashedPassword = userExist.password;
        const match = await await bcrypt.compare(password, hashedPassword);
        if (match) {
          if (userExist.isBlocked)
            return { status: false, message: "Sorry User Blocked" };
          const accessToken = this.JWTServices.generateToken(
            { emailId: userExist.email, role: "user", verified: true },
            { expiresIn: "1h" }
          );
          const refreshToken = this.JWTServices.generateRefreshToken(
            { emailId: userExist.email, role: "user", verified: true },
            { expiresIn: "1d" }
          );

          return {
            status: true,
            accessToken,
            refreshToken,
            message: "logged in sucessfullly",
          };
        } else {
          return { status: false, message: "wrong password" };
        }
      } else {
        return { status: false, message: "person not found" };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
  }> {
    try {
      const exists = await this.Repository.userExist(email);
      if (exists) {
        return {
          status: false,
          message: "User already exists",
          errorCode: "USER_EXIST",
        };
      }
      password = await bcrypt.hash(password, 10);

      const response = await this.Repository.googleSignup(
        email,
        name,
        password
      );
      if (response.status) {
        const accessToken = this.JWTServices.generateToken(
          {
            emailId: email,
            role: "user",
            verified: true,
          },
          { expiresIn: "1h" }
        );
        const refreshToken = this.JWTServices.generateRefreshToken(
          {
            emailId: email,
            role: "user",
            verified: true,
          },
          { expiresIn: "1d" }
        );
        return {
          status: true,
          accessToken,
          refreshToken,
          message: response.message,
        };
      } else {
        return {
          status: true,
          message: response.message,
          errorCode: "SERVER_ERROR",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async googleLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
  }> {
    try {
      console.log("mail", email, password, "password");
      const userExist = await this.Repository.getUser(email);
      if (!userExist) {
        return {
          status: false,
          message: "This user dosent exist",
          errorCode: "NO_USER",
        };
      }
      const hashedPassword = userExist.password;
      const match = await bcrypt.compare(password, hashedPassword);
      if (!match) {
        return {
          status: false,
          message: "Incorrect password",
          errorCode: "INCORRECT_PASSWORD",
        };
      }
      if (userExist.isBlocked)
        return {
          status: false,
          message: "Sorry User Blocked",
          errorCode: "BLOCKED",
        };
      const accessToken = this.JWTServices.generateToken(
        { emailId: userExist.email, role: "user", verified: true },
        { expiresIn: "1h" }
      );
      const refreshToken = this.JWTServices.generateRefreshToken(
        { emailId: userExist.email, role: "user", verified: true },
        { expiresIn: "1d" }
      );

      return {
        status: true,
        accessToken,
        refreshToken,
        message: "logged in Sucessfully",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async resendOtp(email:string): Promise<{ status: boolean; message?: string; errorCode?: string; }> {
      try{
         const mailResponse = await this.Mailer.sendMail(email);
         if(!mailResponse.success){
            return {status:false,message:"error sending email"}
         }
         const otp=mailResponse.otp
         const response=await this.Repository.resendOtp(otp,email)
         if(response){
            return { status: true, message: "otp sucessfully sent" };
         }else{
            return { status: false, message: "retry signup" };

         }



      }
      catch(error){
        console.log(error)
        throw error
      }
  }
  async getProfile(image: string): Promise<{ url: string|null; }> {
      try{
       if(image){
            const command2 = new GetObjectCommand({
              Bucket: s3Config.BUCKET_NAME,
              Key: image,
            });
            const url = await getSignedUrl(s3, command2, {
              expiresIn: 3600,
            });
            return { url: url };
       }else{
        return {url:null}
       }

      }catch(error){
        console.log(error)
        throw error
      }
  }
  async profileUpdate(
    data: any,
    userId:Types.ObjectId,
    email:string
  ): Promise<{ status: boolean; message: string; errorCode?: string,data?:MongoUser }> {
    try {
      console.log("data here",data)
         
        const respose=await this.Repository.updateProfile(userId as Types.ObjectId,data)
        const user=await this.Repository.getUser(email)
      
     
      if(user){
        user.password="****************"
      }
      console.log("user",user)
      console.log("response 2",respose)
      
        if(respose.success){
            return {
                status:true,
                message:"updated sucessfully",
                data:user||undefined
            }
        }else{
              return {
                status: false,
                message: "Error updating",
              };

        }

    } catch (error) {
      console.log(error);
      throw error;
    }
    
  }
  async updateProfileImage(id: Types.ObjectId, image: MulterFile): Promise<{ status: boolean; imageData?: string; }> {
      try{
         try {
           const folderPath = "users";
           const fileExtension = image.originalname.split(".").pop();
           const uniqueFileName = `profile-${id}.${fileExtension}`;
           const key = `${folderPath}/${uniqueFileName}`;
           const command = new PutObjectCommand({
             Bucket: s3Config.BUCKET_NAME,
             Key: key,
             Body: image.buffer,
             ContentType: image.mimetype,
           });
           await s3.send(command);
           const response = await this.Repository.updateProfileImage(id, key);

           const command2 = new GetObjectCommand({
             Bucket: s3Config.BUCKET_NAME,
             Key: key,
           });
           const url = await getSignedUrl(s3, command2, {
             expiresIn: 3600,
           });
           return { status: true, imageData: url };
         } catch (error) {
           console.log(error);
           throw error;
         }

      }
      catch(error){
        throw error
      }
  }
  async passwordResetLink(email: string): Promise<{ status: boolean; message: string; link?: string; }> {
      try{
           
        const user=await this.Repository.getUser(email)
        if(!user)return {status:false,message:"User Not Found"}
        const resetTokenExpiry = Date.now() + 600000;
          const payload = { email,resetTokenExpiry };
          const hashedToken = jwt.sign(payload,process.env.Password_RESET_SECRET as string);
          const resetLink=`http://localhost:5173/reset-password?token=${hashedToken}`
          const result=await this.Mailer.sendPasswordResetLink(email,resetLink)
          if(!result.success)return {status:false,message:"Internal Server Error"}

          return {status:true,message:"Link Sucessfully Sent"}



      }
      catch(error){
        throw error
      }
  }
  async resetPassword(token: string, password: string): Promise<{ status: boolean; message: string; }> {
      try{
        const decodedToken = jwt.verify(
          token,
          process.env.Password_RESET_SECRET as string
        );
        const { email, resetTokenExpiry } = decodedToken as ResetPasswordToken;
        const userExist =await this.Repository.getUser(email)
        if(!userExist)return {status:false,message:"Invalid User"}
        if (Date.now() > new Date(resetTokenExpiry).getTime())
          return { status: false, message: "Expired Link" };
        const hashedPassword=await bcrypt.hash(password,10)
        const response=await this.Repository.resetPassword(email,hashedPassword)
        if(!response)return {status:false,message:"Internal server error"}
        return {status:true,message:"Password Changed Sucessfully"}


      }
      catch(error){
        throw error
      }
  }
  async getDoctorsList(skip:number,limit:number): Promise<{ status: boolean; message: string; errorCode?: string; doctors?: MongoDoctor[];totalPages?:number }> {
      try{
        const result=await this.Repository.getDoctors(skip,limit)

            if (result) {
              for (const doctor of result.doctors as MongoDoctor[]) {
                if (doctor.image) {
                  const command2 = new GetObjectCommand({
                    Bucket: s3Config.BUCKET_NAME,
                    Key: doctor.image,
                  });
                  const url = await getSignedUrl(s3, command2, {
                    expiresIn: 3600,
                  });
                  doctor.image = url;
                }
              }

              return {
                status: true,
                message: "Successfully fetched",
                doctors: result.doctors,
                totalPages:result.totalPages
              };
            }

        return {status:false,message:"Something Went Wrong"}

      }
      catch(error){
        throw error
      }
  }
  async getDoctorPage(id: string): Promise<{ status: boolean; message: string; doctor?: MongoDoctor; }> {
      try{
        const response=await this.Repository.getDoctor(id)
        if(!response) return {status:false,message:"something went wrong"}
       if(response.image){
         const command = new GetObjectCommand({
           Bucket: s3Config.BUCKET_NAME,
           Key: response.image as string,
         });
         const url = await getSignedUrl(s3, command, {
           expiresIn: 3600,
         });
         response.image = url;
       }
        return {status:true,message:"Sucessful",doctor:response}

      }
      catch(error){
        throw error
      }
  }
  async getAvailableDate(id: string): Promise<{ status: boolean; message: string; dates?: string[]; }> {
      try{
        const result=await this.Repository.getSlots(id)
        if(!result) return {status:false,message:"no available slots"}
        const dates = [
          ...new Set(
            result.map((slot) => slot.date.toISOString().split("T")[0])
          ),
        ];
        return {status:true,message:"Success",dates:dates}


      }
      catch(error){
        throw error
      }
  }
  async getTimeSlots(id: string, date: string): Promise<{ status: boolean; message: string; slots?: DoctorSlots; }> {
      try{
        const result=await this.Repository.getTimeSlots(id,date)
        console.log("result",result)
        if(!result) return {status:false,message:"Something went wrong"}
        return {status:true,message:"Success",slots:result}

      }
      catch(error){
        throw error
      }
  }
  async razorPayOrderGenerate(amount:string,currency:string,receipt:string): Promise<{ status: boolean; order?: any; message: string; }> {
      try{
        const order=await instance.orders.create({amount,currency,receipt})
        if(!order)return {status:false,message:"Something Went Wrong"}
        return {status:true,message:"Success",order:order}

      }
      catch(error){
        throw error
      }
  }
async razorPayValidateBook(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string,docId:Types.ObjectId,slotDetails:any,userId:Types.ObjectId,fees:string): Promise<{status:boolean;message?:string;appointment?:IAppointment}> {
  try {

    console.log("docId",docId,"slotDetails",slotDetails)
    const razorPaySecret = process.env.RazorPaySecret;

    const sha = crypto.createHmac("sha256", razorPaySecret as string);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return {status:false,message:"Payment failure"}
    }
    const slotId=slotDetails.slotTime._id
     const isoDate = new Date(slotDetails.date).toISOString(); 
     const start = new Date(slotDetails.slotTime.start).toISOString(); 
     const end = new Date(slotDetails.slotTime.end).toISOString(); 
    const slotBooking=await this.Repository.bookSlot(docId ,userId,slotId,isoDate)
    if(!slotBooking)return { status: false, message: "Slot is not locked by you or lock has expired." };
     const totalFees = parseFloat(fees);
     const appointmentFees = (totalFees * 0.8).toFixed(2);
    const result=await this.Repository.createAppointment(userId,docId,isoDate,start,end,fees,razorpay_payment_id,appointmentFees.toString())
    if(!result) return {status:false,message:"Something Went Wrong"}
    await this.Repository.doctorWalletUpdate(docId,result._id as Types.ObjectId,Number(appointmentFees),"credit","Appointment Booked","razorpay")
    return {status:true,message:"Success",appointment:result}
  } catch (error) {
    throw error;
  }
}
async lockSlot(userId:Types.ObjectId,docId:Types.ObjectId,date:Date,slotId:Types.ObjectId): Promise<{ status: boolean; message?: string; errorCode?: string; }> {
    try{
      const lockExpiration = new Date(Date.now() + 5 * 60 * 1000);
      const isoDate = new Date(date).toISOString(); 
      const response=await this.Repository.lockSlot(userId,docId,isoDate,slotId,lockExpiration)
      if(!response)return {status:false,message: "Slot is already locked or not available." }
      return { status: true, message: "Slot locked successfully." };


    }
    catch(error){
      throw error
    }
}
 
}
export default UserInteractor