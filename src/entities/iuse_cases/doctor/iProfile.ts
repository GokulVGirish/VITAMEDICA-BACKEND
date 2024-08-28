import { Types } from "mongoose";
import { MongoDoctor } from "../../rules/doctor";
import { MulterFile } from "../../rules/multerFile";


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
}
export default IDoctorProfileInteractor