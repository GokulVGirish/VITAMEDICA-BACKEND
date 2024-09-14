import IUserRepository from "../../entities/irepositories/iuserRepository";
import IUserProfileInteractor from "../../entities/iuse_cases/user/iProfile";
import  { IawsS3 } from "../../entities/services/awsS3";
import { Types } from "mongoose";
import { MongoUser } from "../../entities/rules/user";
import { MulterFile } from "../../entities/rules/multerFile";
import { ResetPasswordToken } from "../../entities/rules/resetPassword";
import bcrypt from "bcryptjs";
import { IMailer } from "../../entities/services/mailer";
import jwt from "jsonwebtoken";
import { INotificationContent } from "../../entities/rules/Notifications";


class ProfileInteractor implements IUserProfileInteractor {
  constructor(
    private readonly Repository: IUserRepository,
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
    data?: MongoUser;
  }> {
    try {
      console.log("data here", data);

      const respose = await this.Repository.updateProfile(
        userId as Types.ObjectId,
        data
      );
      const user = await this.Repository.getUser(email);

      if (user) {
        user.password = "****************";
      }
      console.log("user", user);
      console.log("response 2", respose);

      if (respose.success)
        return {
          status: true,
          message: "updated sucessfully",
          data: user || undefined,
        };
      else
        return {
          status: false,
          message: "Error updating",
        };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProfileImage(
    id: Types.ObjectId,
    image: MulterFile
  ): Promise<{ status: boolean; imageData?: string }> {
    try {
      try {
        const folderPath = "users";
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
    } catch (error) {
      throw error;
    }
  }
  async passwordResetLink(
    email: string
  ): Promise<{ status: boolean; message: string; link?: string }> {
    try {
      const user = await this.Repository.getUser(email);
      if (!user) return { status: false, message: "User Not Found" };
      const resetTokenExpiry = Date.now() + 600000;
      const payload = { email, resetTokenExpiry };
      const hashedToken = jwt.sign(
        payload,
        process.env.Password_RESET_SECRET as string
      );
      const resetLink = `${process.env.cors_origin}/reset-password?token=${hashedToken}&request=user`;
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
      const userExist = await this.Repository.getUser(email);
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
  async fetchNotificationCount(userId: Types.ObjectId): Promise<number> {
    try {
      const count = await this.Repository.fetchNotificationCount(userId);
      return count;
    } catch (error) {
      throw error;
    }
  }
  async fetchNotifications(
    userId: Types.ObjectId
  ): Promise<INotificationContent[]> {
    try {
      const result = await this.Repository.fetchNotifications(userId);
      return result;
    } catch (error) {
      throw error;
    }
  }
  async markNotificationAsRead(userId: Types.ObjectId): Promise<boolean> {
    try {
      const response = await this.Repository.markNotificationAsRead(userId);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
export default ProfileInteractor