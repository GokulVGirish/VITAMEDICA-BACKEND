import IAppointment from "../../rules/appointments";
import { MongoDoctor } from "../../rules/doctor";


interface IAdminDoctorManagementInteractor {
  getUnverifiedDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }>;
  getDoctorDocs(id: string): Promise<{ status: boolean; doctor?: MongoDoctor }>;
  verifyDoctor(id: string): Promise<boolean>;
  getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }>;
  blockUnblockDoctor(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }>;
  rejectDoctor(
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string }>;
  getDoctorProfile(id:string,page:number,limit:number):Promise<{status:boolean,message:string,data?:MongoDoctor}>
  getDoctorAppointments(id:string,page:number,limit:number):Promise<{status:boolean,message:string,data?:IAppointment[]}>
  
}
export default IAdminDoctorManagementInteractor