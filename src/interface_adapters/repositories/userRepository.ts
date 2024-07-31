import IUserRepository from "../../entities/irepositories/iuserRepository";
import otpModel from "../../frameworks/mongoose/models/OtpSchema";
import { MongoUser, User } from "../../entities/rules/user";
import userModel from "../../frameworks/mongoose/models/UserSchema";


class UserRepository implements IUserRepository {

  async tempOtpUser(data: User): Promise<{ status: true | false}> {
    try {
      const tempUser = await otpModel.create(data);
      if (tempUser) {
        return { status: true };
      } else {
        return { status: false };
      }
    } catch (error) {
     
        throw error
    }
  }
  async userExist(email: string): Promise<boolean> {
      const user=await userModel.findOne({email:email})
      return !!user 
  }
  async createUserOtp(otp: string): Promise<{ status: boolean;user?:any }> {
      
    try{
        const otpUser=await otpModel.findOne({otp:otp})
     
        if(otpUser){
               const now=new Date()
        const expirationTime=new Date(otpUser?.time.getTime()+ 2 * 60 * 1000)

          if(now<expirationTime){
                const user=await userModel.create({

                name:otpUser.name,
                email:otpUser.email,
                phone:otpUser.phone,
                password:otpUser.password,
                gender:otpUser.gender,
                bloodGroup:otpUser.bloodGroup,
                dob:otpUser.dob
            })
            return {status:true,user}

          }else{
            return {status:false}

          }
        }else{
            return {status:false}
        }

    }
    catch(error){
        console.log(error)
        throw error

    }
  }
  async getUser(email: string): Promise<MongoUser|null> {
    try{
        const user=await userModel.findOne({email:email})
        return user
        

    }
    catch(error){
        console.log(error)
        throw error
    }
      
  }
  async googleSignup(email: string, name: string, password: string): Promise<{ status: boolean; message: string; }> {
      try{
        const user=await userModel.create({
          name:name,
          email:email,
          password:password,
          register:"Google"
        })
        if(user){
          return {
            status:true,
            message:"Signed Up Sucessfully"
          }
        }else{
          return {
            status:false,
            message:"error signing up"
          }
        }

      }
      catch(error){
        console.log(error)
        throw error
      }
  }
  async updateProfile(data: User): Promise<{success:boolean}> {
      try{
        const response = await userModel.updateOne(
          { _id: data._id },
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
              postalCode:data.address?.postalCode,
            },
            image:data.image
          }
        );
        if(response){
          return {success:true}
        }else{
          return {success:false}
        }

      }
      catch(error){
        console.log(error)
        throw error
      }
  }
  async resendOtp(otp: string,email:string): Promise<boolean> {
      try{
        const otpDoc=await otpModel.findOne({email:email})
        if(otpDoc){
          otpDoc.otp=otp
          otpDoc.time=new Date()
          await otpDoc.save()
          return true
        }else{
          return false

        }


      }
      catch(error){
        console.log(error)
        throw error
      }
  }

  
}
export default UserRepository