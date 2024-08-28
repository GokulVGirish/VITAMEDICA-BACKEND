import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminUserManagement from "../../entities/iuse_cases/admin/iUserManagement";
import { MongoUser } from "../../entities/rules/user";
import { io } from "../../frameworks/express/app";


class AdminUserManagementInteractor implements IAdminUserManagement {
  constructor(private readonly repository: IAdminRepository) {}
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

    }
    catch(error){
      throw error
    }
      
  }
}
export default AdminUserManagementInteractor