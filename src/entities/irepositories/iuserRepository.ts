import { User } from "../rules/user"
import { MongoUser } from "../rules/user"

interface IUserRepository {
  tempOtpUser(data: User): Promise<{ status: true | false }>;
  userExist(email: string): Promise<boolean>;
  createUserOtp(otp: string): Promise<{ status: boolean; user?: any }>;
  getUser(email: string): Promise<MongoUser | null>;
  googleSignup(
    email: string,
    name: string,
    password: string,
  ): Promise<{ status: boolean; message: string; }>;
  resendOtp(otp:string,email:string):Promise<boolean>
  updateProfile(data:User):Promise<{success:boolean}>
 
}
export default IUserRepository