import { promises } from "dns";
import { MongoAdmin } from "../rules/admin"
import MongoDepartment from "../rules/departments"
import { MongoDoctor } from "../rules/doctor";
import { MongoUser, User } from "../rules/user";
import { Types } from "mongoose";
import IAppointment from "../rules/appointments";
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
  deleteDoctor(id: string): Promise<boolean>;
  createRejectedDoctor(email: string, reason: string): Promise<boolean>;
  getWeeklyRevenue(): Promise<{ label: string; totalRevenue: number }[]>;
  getWeeklyAppointmentCount(): Promise<{
    appointmentsCount: number;
    cancellationsCount: number;
  }>;
  getMonthlyRevenue(): Promise<{ label: string; totalRevenue: number }[]>;
  getMonthlyAppointmentCount(): Promise<{
    appointmentsCount: number;
    cancellationsCount: number;
  }>;
  getYearlyRevenue(): Promise<{ label: string; totalRevenue: number }[]>;
  getTodaysRevenue(): Promise<number>;
  getTodaysAppointmentCount(): Promise<{
    appointmentsCount: number;
    cancellationsCount: number;
  }>;
  getUnverifiedDoctorsCount(): Promise<number>;
  getUsersCount(): Promise<number>;
  getDoctorsCount(): Promise<number>;
  fetchAppointments(page: number, limit: number): Promise<IAppointment[] | []>;
  fetchAppointmentDetail(id: string): Promise<IAppointment>;
  getDoctorProfile(
    id: string,
    page: number,
    limit: number
  ): Promise<MongoDoctor>;
  getUserProfile(id: string):Promise<User|null>
}
export default IAdminRepository