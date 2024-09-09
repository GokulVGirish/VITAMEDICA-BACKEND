import { Types } from "mongoose";
import { MongoUser } from "../../rules/user";
import { MulterFile } from "../../rules/multerFile";
import { INotificationContent } from "../../rules/Notifications";


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
  fetchNotificationCount(userId: Types.ObjectId): Promise<number>;
  fetchNotifications(userId: Types.ObjectId): Promise<INotificationContent[]>;
  markNotificationAsRead(userId: Types.ObjectId):Promise<boolean>
}

export default IUserProfileInteractor