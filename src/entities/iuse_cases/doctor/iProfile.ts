import { Types } from "mongoose";
import { MongoDoctor } from "../../rules/doctor";
import { MulterFile } from "../../rules/multerFile";
import { INotificationContent } from "../../rules/Notifications";


interface IDoctorProfileInteractor {
  getProfile(image: string): Promise<{ url: string | null }>;
  profileUpdate(
    data: any,
    userId: Types.ObjectId,
    email: string
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    data?: MongoDoctor;
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
  fetchNotificationCount(docId: Types.ObjectId): Promise<number>;
  fetchNotifications(docId: Types.ObjectId): Promise<INotificationContent[]>;
  markNotificationAsRead(docId: Types.ObjectId): Promise<boolean>;
}
export default IDoctorProfileInteractor