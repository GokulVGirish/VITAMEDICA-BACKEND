import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import IDoctorProfileInteractor from "../../entities/iuse_cases/doctor/iProfile";
import { ResetPasswordToken } from "../../entities/rules/resetPassword";
import { IawsS3 } from "../../entities/services/awsS3";
import bcrypt from "bcryptjs";
import { IMailer } from "../../entities/services/mailer";
import jwt from "jsonwebtoken";
import { MongoDoctor } from "../../entities/rules/doctor";
import { Types } from "mongoose";
import { MulterFile } from "../../entities/rules/multerFile";
import { error } from "console";
import { INotificationContent } from "../../entities/rules/Notifications";



class DoctorProfileInteractor implements IDoctorProfileInteractor {
  constructor(
    private readonly Repository: IDoctorRepository,
    private readonly Mailer: IMailer,
    private readonly AwsS3: IawsS3
  ) {}
  async getProfile(image: string): Promise<{ url: string | null }> {
    try {
      if (image) {
        const command = this.AwsS3.getObjectCommandS3(image);
        const url = await this.AwsS3.getSignedUrlS3(command, 3600);
        return { url: url };
      } else {
        return { url: null };
      }
    } catch (error) {
      throw error;
    }
  }
  async updateProfileImage(
    id: Types.ObjectId,
    image: MulterFile
  ): Promise<{ status: boolean; imageData?: string }> {
    try {
      const folderPath = "doctors";
      const fileExtension = image.originalname.split(".").pop();
      const uniqueFileName = `profile-${id}.${fileExtension}`;
      const key = `${folderPath}/${uniqueFileName}`;
      await this.AwsS3.putObjectCommandS3(key, image.buffer, image.mimetype);
      const response = await this.Repository.updateProfileImage(id, key);
      const command = this.AwsS3.getObjectCommandS3(key);
      const url = await this.AwsS3.getSignedUrlS3(command, 3600);
      return { status: true, imageData: url };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async profileUpdate(
    data: any,
    userId: Types.ObjectId,
    email: string
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    data?: MongoDoctor;
  }> {
    try {
      const response = await this.Repository.profileUpdate(userId, {
        name: data.name,
        phone: data.phone,
        description: data.description,
        fees: data.fees,
        degree: data.degree,
        accountNumber: data.bankDetails.accountNumber,
        ifsc: data.bankDetails.ifsc,
      });
      if (!response) return { status: false, message: "internal server error" };
      const result = await this.Repository.getDoctor(email);
      if (result) {
        return {
          status: true,
          data: result,
          message: "Profile sucessfully Updated",
        };
      } else {
        return { status: false, message: "internal server error" };
      }
    } catch (error) {
      throw error;
    }
  }
  async passwordResetLink(
    email: string
  ): Promise<{ status: boolean; message: string; link?: string }> {
    try {
      const user = await this.Repository.getDoctor(email);
      if (!user) return { status: false, message: "User Not Found" };
      const resetTokenExpiry = Date.now() + 600000;
      const payload = { email, resetTokenExpiry };
      const hashedToken = jwt.sign(
        payload,
        process.env.Password_RESET_SECRET as string
      );
      const resetLink = `http://localhost:5173/reset-password?token=${hashedToken}&request=doctor`;
      const result = await this.Mailer.sendPasswordResetLink(email, resetLink);
      if (!result.success)
        return { status: false, message: "Internal Server Error" };

      return { status: true, message: "Link Sucessfully Sent" };
    } catch (error) {
      throw error;
    }
  }
  async resetPassword(
    token: string,
    password: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.Password_RESET_SECRET as string
      );
      const { email, resetTokenExpiry } = decodedToken as ResetPasswordToken;
      const userExist = await this.Repository.getDoctor(email);
      if (!userExist) return { status: false, message: "Invalid User" };
      if (Date.now() > new Date(resetTokenExpiry).getTime())
        return { status: false, message: "Expired Link" };
      const hashedPassword = await bcrypt.hash(password, 10);
      const response = await this.Repository.resetPassword(
        email,
        hashedPassword
      );
      if (!response) return { status: false, message: "Internal server error" };
      return { status: true, message: "Password Changed Sucessfully" };
    } catch (error) {
      throw error;
    }
  }
  async fetchNotificationCount(docId: Types.ObjectId): Promise<number> {
    try {
      const count = await this.Repository.fetchNotificationCount(docId);
      return count;
    } catch (error) {
      throw error;
    }
  }
  async fetchNotifications(
    docId: Types.ObjectId
  ): Promise<INotificationContent[]> {
    try {
      const result = await this.Repository.fetchNotifications(docId);
      return result;
    } catch (error) {
      throw error;
    }
  }
  async markNotificationAsRead(docId: Types.ObjectId): Promise<boolean> {
      try{

        const response=await this.Repository.markNotificationAsRead(docId)
        return response

      }
      catch(error){
        throw error

      }
  }
}
export default DoctorProfileInteractor