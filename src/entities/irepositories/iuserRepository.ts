import { User } from "../rules/user"
import { MongoUser } from "../rules/user"
import { Types } from "mongoose"

interface IUserRepository {
  tempOtpUser(data: User): Promise<{ status: true | false }>;
  userExist(email: string): Promise<boolean>;
  createUserOtp(otp: string): Promise<{ status: boolean; user?: any }>;
  getUser(email: string): Promise<MongoUser | null>;
  googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{ status: boolean; message: string }>;
  resendOtp(otp: string, email: string): Promise<boolean>;
  updateProfile(id: Types.ObjectId, data: User): Promise<{ success: boolean }>;
  updateProfileImage(id: Types.ObjectId, imagePath: string): Promise<boolean>;
  resetPassword(email:string,password:string):Promise<boolean>
}
export default IUserRepository