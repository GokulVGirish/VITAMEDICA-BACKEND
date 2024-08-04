import { MongoAdmin } from "../rules/admin"
import MongoDepartment from "../rules/departments"
import { MongoDoctor } from "../rules/doctor";
import { MongoUser } from "../rules/user";
import { Types } from "mongoose";
export interface IAdminRepository {
  getAdmin(email: string): Promise<MongoAdmin | null>;
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  addDepartment(
    name: string
  ): Promise<{ status: boolean; department?: MongoDepartment }>;
  deleteDepartment(id: string): Promise<{ status: boolean; message?: string }>;
  getUsers(): Promise<{
    status: boolean;
    message: string;
    users?: MongoUser[];
  }>;
  blockUnblockUser(id: string, status: boolean): Promise<boolean>;
  getUnverifiedDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }>;
  getDoctor(id: string): Promise<{ status: boolean; doctor?: MongoDoctor }>;
  verifyDoctor(id: string): Promise<boolean>;
  getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }>;
  blockUnblockDoctor(id: string, status: boolean): Promise<boolean>;
   deleteDoctor(id:string):Promise<boolean>
   createRejectedDoctor(email:string,reason:string):Promise<boolean>
}
export default IAdminRepository