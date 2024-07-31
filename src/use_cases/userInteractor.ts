import { IUserInteractor } from "../entities/iuse_cases/iuserInteractor";
import IUserRepository from "../entities/irepositories/iuserRepository";
import { MongoUser, User } from "../entities/rules/user";
import { IMailer } from "../entities/services/mailer";
import { IJwtService } from "../entities/services/jwtServices";
import bcrypt from "bcryptjs"

import { S3Client ,PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
import s3Config from "../entities/services/awsS3";

import { MulterFile } from "../entities/rules/multerFile";
import MongoDepartment from "../entities/rules/departments";

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
    file:MulterFile,
    userId:string
  ): Promise<{ status: boolean; message: string; errorCode?: string,data?:MongoUser }> {
    try {
         const folderPath = 'users';
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `profile-${userId}.${fileExtension}`;
    const key = `${folderPath}/${uniqueFileName}`;

        const command = new PutObjectCommand({
          Bucket: s3Config.BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });
        await s3.send(command)
        data.image=key
        data._id=userId
        if (data.address) {
          if (data.address.postalCode) {
            console.log("posrcode", data.address.postalCode);
            data.address.postalCode = Number(data.address.postalCode);
          }
        }
        const respose=await this.Repository.updateProfile(data)
        const user=await this.Repository.getUser(data.email)
     
        if(user){
               const command2 = new GetObjectCommand({
                 Bucket: s3Config.BUCKET_NAME,
                 Key: key ,
               });
               const url = await getSignedUrl(s3, command2, {
                 expiresIn: 3600,
               });
            user.password="********"
            user.image=url
        }
      
      
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
 
}
export default UserInteractor