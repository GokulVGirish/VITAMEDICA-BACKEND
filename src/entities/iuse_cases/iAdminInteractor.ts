import MongoDepartment from "../rules/departments"
import { MongoDoctor } from "../rules/doctor";
import { MongoUser } from "../rules/user"
export interface IAdminInteractor {
  adminLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    adminAccessToken?: string;
    adminRefreshToken?: string;
    message: string;
  }>;
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  addDepartment(name: string): Promise<{
    status: boolean;
    department?: MongoDepartment;
    message?: string;
  }>;
  deleteDepartment(id: string): Promise<{ status: boolean; message?: string }>;
  getUsers(): Promise<{
    status: boolean;
    message: string;
    users?: MongoUser[];
  }>;
  blockUnblockUser(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }>;
  getUnverifiedDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }>;
  getDoctorDocs(id: string): Promise<{ status: boolean; doctor?: MongoDoctor }>;
  verifyDoctor(id: string): Promise<boolean>;
  getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }>;
  blockUnblockDoctor(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }>;
}