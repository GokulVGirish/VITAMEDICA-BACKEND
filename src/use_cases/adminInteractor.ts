import { IAdminInteractor } from "../entities/iuse_cases/iAdminInteractor"
import IAdminRepository from "../entities/irepositories/iAdminRepository";
import { IJwtService } from "../entities/services/jwtServices";
import bcrypt from "bcryptjs"
import MongoDepartment from "../entities/rules/departments";
import { MongoUser } from "../entities/rules/user";
import { MongoDoctor } from "../entities/rules/doctor";

import { S3Client ,PutObjectCommand,GetObjectCommand, S3} from "@aws-sdk/client-s3";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
import s3Config from "../entities/services/awsS3";
const s3=new S3Client({
    region:s3Config.BUCKET_REGION,
    credentials:{
        accessKeyId:s3Config.ACCESS_KEY,
        secretAccessKey:s3Config.SECRET_KEY
    }
})
class AdminInteractor implements IAdminInteractor {
  constructor(
    private readonly repository: IAdminRepository,
    private readonly JwtServices: IJwtService
  ) {}

  async adminLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    adminAccessToken?: string;
    adminRefreshToken?: string;
    message: string;
  }> {
    try {
      const adminExist = await this.repository.getAdmin(email);
      if (adminExist) {
        const hashedPassword = adminExist.password;
        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
          const adminAccessToken = this.JwtServices.generateToken(
            { emailId: adminExist.email, verified: true, role: "admin" },
            { expiresIn: "1h" }
          );
          const adminRefreshToken = this.JwtServices.generateRefreshToken(
            { emailId: adminExist.email, verified: true, role: "admin" },
            { expiresIn: "1d" }
          );
          return {
            status: true,
            adminAccessToken,
            adminRefreshToken,
            message: "logged in sucessfully",
          };
        } else {
          return { status: false, message: "incorrect password" };
        }
      } else {
        return {
          status: false,
          message: "Admin not found",
        };
      }
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
      const response = await this.repository.getDepartments();
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
  async addDepartment(
    name: string
  ): Promise<{
    status: boolean;
    department?: MongoDepartment;
    message?: string;
  }> {
    try {
      const data = await this.repository.getDepartments();
      const exists = data.departments?.find(
        (dep) => dep.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        return { status: false, message: "Department already exist" };
      }
      const response = await this.repository.addDepartment(name);
      if (response.status) {
        return {
          status: true,
          department: response.department,
        };
      } else {
        return {
          status: false,
          message: "internal server error",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteDepartment(
    id: string
  ): Promise<{ status: boolean; message?: string }> {
    try {
      const response = await this.repository.deleteDepartment(id);
      if (response.status) {
        return { status: true, message: response.message };
      } else {
        return { status: true, message: response.message };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUsers(): Promise<{
    status: boolean;
    message: string;
    users?: MongoUser[];
  }> {
    try {
      const response = await this.repository.getUsers();
      if (response.status) {
        return {
          status: true,
          message: response.message,
          users: response.users as MongoUser[],
        };
      } else {
        return {
          status: false,
          message: response.message,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async blockUnblockUser(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      let changedStatus;
      if (status === "true") {
        changedStatus = false;
      } else {
        changedStatus = true;
      }
      const response = await this.repository.blockUnblockUser(
        id,
        changedStatus
      );
      if (!response) {
        return { status: false, message: "internal server error" };
      }
      return {
        status: true,
        message: `user has been sucessfully ${
          changedStatus ? "Blocked" : "Unblocked"
        }`,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUnverifiedDoctors(): Promise<{
    status: boolean;
    doctors?: MongoDoctor[];
  }> {
    try {
      const response = await this.repository.getUnverifiedDoctors();
      if (response.status) {
        return { status: true, doctors: response.doctors };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getDoctorDocs(
    id: string
  ): Promise<{ status: boolean; doctor?: MongoDoctor }> {
    try {
        
      const result = await this.repository.getDoctor(id);
      if (!result.status) {
        return { status: false };
      }
      const doctor = result.doctor;
      if (!doctor || !doctor.documents) {
        return { status: false };
      }

      const certificateImage = await this.getSignedUrlForImage(
        doctor.documents.certificateImage!
      );
      const qualificationImage = await this.getSignedUrlForImage(
        doctor.documents.qualificationImage!
      );
      const aadarFrontImage = await this.getSignedUrlForImage(
        doctor.documents.aadarFrontImage!
      );
      const aadarBackImage = await this.getSignedUrlForImage(
        doctor.documents.aadarBackImage!
      );
     
      doctor.documents.certificateImage = certificateImage;
      doctor.documents.qualificationImage = qualificationImage;
      doctor.documents.aadarFrontImage = aadarFrontImage;
      doctor.documents.aadarBackImage = aadarBackImage;
      return {status:true,doctor:doctor}
    } catch (error) {
      console.log(error);
      throw error
    }
  }
  async getSignedUrlForImage(imageKey: string): Promise<string | null> {
    try {
      if (imageKey) {
        const command = new GetObjectCommand({
          Bucket: s3Config.BUCKET_NAME,
          Key: imageKey,
        });
        const url = await getSignedUrl(s3, command, {
          expiresIn: 3600, // URL expiration time in seconds
        });
        return url;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyDoctor(id: string): Promise<boolean> {
      try{
        const result=await this.repository.verifyDoctor(id)
        return result

      }
      catch(error){
        throw error
      }
  }
  async getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[]; }> {
      try{
        const response =await this.repository.getDoctors()
        if(response.status){
            return {status:true,doctors:response.doctors}
        }else{
            return {status:false}
        }

      }
      catch(error){
        console.log(error)
        throw error
      }
  }
  async blockUnblockDoctor(id: string, status: string): Promise<{ status: boolean; message: string; }> {
      try{
         let changedStatus;
         if (status === "true") {
           changedStatus = false;
         } else {
           changedStatus = true;
         }
        const response=await this.repository.blockUnblockDoctor(id,changedStatus)
         if (!response) {
           return { status: false, message: "internal server error" };
         }
           return {
             status: true,
             message: `user has been sucessfully ${
               changedStatus ? "Blocked" : "Unblocked"
             }`,
           };

      }
      catch(error){
        throw error
      }
  }
}
export default AdminInteractor