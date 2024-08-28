import { Types } from "mongoose";
import { MongoUser } from "../../rules/user";
import { MulterFile } from "../../rules/multerFile";


interface IUserProfileInteractor {
  getProfile(image: string): Promise<{ url: string | null }>;
  profileUpdate(
    data: any,
    userId: Types.ObjectId,
    email: string
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    data?: MongoUser;
  }>;
  updateProfileImage(
    id: Types.ObjectId,
    image: MulterFile
  ): Promise<{ status: boolean; imageData?: string }>;
  passwordResetLink(
    email: string
  ): Promise<{ status: boolean; message: string; link?: string }>;
  resetPassword(
    token: string,
    password: string
  ): Promise<{ status: boolean; message: string }>;
}

export default IUserProfileInteractor