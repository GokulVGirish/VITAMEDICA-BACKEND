import { MongoUser } from "../../rules/user";



interface IAdminUserManagement {
  getUsers(): Promise<{
    status: boolean;
    message: string;
    users?: MongoUser[];
  }>;
  blockUnblockUser(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }>;
  getUserProfile(id:string):Promise<{status:boolean,message:string,data?:MongoUser}>
}
export default IAdminUserManagement