import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminUserManagement from "../../entities/iuse_cases/admin/iUserManagement";
import IAppointment from "../../entities/rules/appointments";
import { MongoUser } from "../../entities/rules/user";
import { IawsS3 } from "../../entities/services/awsS3";
import { io } from "../../frameworks/express/app";


class AdminUserManagementInteractor implements IAdminUserManagement {
  constructor(private readonly repository: IAdminRepository,private readonly AwsS3:IawsS3) {}
  async getUsers(): Promise<{
    status: boolean;
    message: string;
    users?: MongoUser[];
  }> {
    try {
      const response = await this.repository.getUsers();
      if (response.status) {
        return {
          status: true,
          message: response.message,
          users: response.users as MongoUser[],
        };
      } else {
        return {
          status: false,
          message: response.message,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async blockUnblockUser(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      let changedStatus;
      if (status === "true") {
        changedStatus = false;
      } else {
        changedStatus = true;
      }
      const response = await this.repository.blockUnblockUser(
        id,
        changedStatus
      );
      if (!response) {
        return { status: false, message: "internal server error" };
      }

      if (changedStatus) {
        io.to(id).emit("blocked", "user");
      }

      return {
        status: true,
        message: `user has been sucessfully ${
          changedStatus ? "Blocked" : "Unblocked"
        }`,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserProfile(id: string): Promise<{ status: boolean; message: string; data?: MongoUser; }> {
    try{
      const result=await this.repository.getUserProfile(id)
      
      if(!result)  return { status: false, message: "Couldnt fetch data" };
     if(result.image){
       const command = this.AwsS3.getObjectCommandS3(result.image);
       const url = await this.AwsS3.getSignedUrlS3(command, 3600);
       result.image = url;
     }
        return { status: true, message: "Success", data: result };
     

    }
    catch(error){
      throw error
    }
      
  }
  async getUserAppointments(id: string,page:number,limit:number): Promise<{ status: boolean; message: string; data?: IAppointment[]; }> {
      try{
        const result=await this.repository.getUserAppointments(id,page,limit)
        if(result.length===0) return {status:false,message:"Couldnt fetch data"}
        return {status:true,message:"Success",data:result}

      }
      catch(error){
        throw error
      }
  }
}
export default AdminUserManagementInteractor