import IUserRepository from "../../entities/irepositories/iuserRepository";
import otpModel from "../../frameworks/mongoose/models/OtpSchema";
import { MongoUser, User } from "../../entities/rules/user";
import userModel from "../../frameworks/mongoose/models/UserSchema";
import { Types } from "mongoose";


class UserRepository implements IUserRepository {
  async tempOtpUser(data: User): Promise<{ status: true | false }> {
    try {
      const tempUser = await otpModel.create(data);
      if (tempUser) {
        return { status: true };
      } else {
        return { status: false };
      }
    } catch (error) {
      throw error;
    }
  }
  async userExist(email: string): Promise<boolean> {
    const user = await userModel.findOne({ email: email });
    return !!user;
  }
  async createUserOtp(otp: string): Promise<{ status: boolean; user?: any }> {
    try {
      const otpUser = await otpModel.findOne({ otp: otp });

      if (otpUser) {
        const now = new Date();
        const expirationTime = new Date(
          otpUser?.time.getTime() + 2 * 60 * 1000
        );

        if (now < expirationTime) {
          const user = await userModel.create({
            name: otpUser.name,
            email: otpUser.email,
            phone: otpUser.phone,
            password: otpUser.password,
            gender: otpUser.gender,
            bloodGroup: otpUser.bloodGroup,
            dob: otpUser.dob,
          });
          return { status: true, user };
        } else {
          return { status: false };
        }
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUser(email:string): Promise<MongoUser | null> {
    try {
      const user = await userModel.findOne({ email:email });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const user = await userModel.create({
        name: name,
        email: email,
        password: password,
        register: "Google",
      });
      if (user) {
        return {
          status: true,
          message: "Signed Up Sucessfully",
        };
      } else {
        return {
          status: false,
          message: "error signing up",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProfile(userId:Types.ObjectId,data: User): Promise<{ success: boolean }> {
    try {
      const response = await userModel.updateOne(
        { _id: userId },
        {
          name: data.name,
          phone: data.phone,
          dob: data.dob,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          address: {
            street: data.address?.street,
            city: data.address?.city,
            state: data.address?.state,
            postalCode: data.address?.postalCode,
          }
        }
      );
      console.log("response",response)
      if (response.modifiedCount>0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async resendOtp(otp: string, email: string): Promise<boolean> {
    try {
      const otpDoc = await otpModel.findOne({ email: email });
      if (otpDoc) {
        otpDoc.otp = otp;
        otpDoc.time = new Date();
        await otpDoc.save();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProfileImage(
    id: Types.ObjectId,
    imagePath: string
  ): Promise<boolean> {
    try {
      const result = await userModel.updateOne(
        { _id: id },
        { $set: { image: imagePath } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async resetPassword(email: string, password: string): Promise<boolean> {
      try{
        const result=await userModel.updateOne({email:email},{$set:{password:password}})
        return result.modifiedCount>0

      }
      catch(error){
        throw error
      }
  }
}
export default UserRepository