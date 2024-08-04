import { MongoUser, User } from "../rules/user"
import { MulterFile } from "../rules/multerFile";
import { Types } from "mongoose";

export interface IUserInteractor {
  //   signup(user:User):Promise<{user:User|null}>;
  otpSignup(
    user: User
  ): Promise<{ status: true | false; message?: string; token?: string }>;
  verifyOtpSignup(
    otp: string
  ): Promise<{ status: boolean; accessToken?: string; refreshToken?: string }>;
  login(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
  }>;
  googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
  }>;
  googleLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
  }>;
  resendOtp(email:string):Promise<{status:boolean,message?:string,errorCode?:string}>
  getProfile(image:string):Promise<{url:string|null}>
  profileUpdate(
    data: any,
    userId:Types.ObjectId,
    email:string
  ): Promise<{ status: boolean; message: string; errorCode?: string,data?:MongoUser }>;
  updateProfileImage(id:Types.ObjectId,image:MulterFile):Promise<{status:boolean;imageData?:string}>
  passwordResetLink(email:string):Promise<{status:boolean;message:string,link?:string}>
  resetPassword(token:string,password:string):Promise<{status:boolean;message:string}>
 
}