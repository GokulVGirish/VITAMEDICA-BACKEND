import { MongoAdmin } from "../rules/admin"
import MongoDepartment from "../rules/departments"
import { MongoDoctor } from "../rules/doctor";
import { MongoUser, User } from "../rules/user";
import IAppointment from "../rules/appointments";
import mongoose, { Types } from "mongoose";
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

  getUsersCount(): Promise<number>;

  fetchAppointments(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<IAppointment[] | []>;
  fetchAppointmentDetail(id: string): Promise<IAppointment>;
  getDoctorProfile(
    id: string,
    page: number,
    limit: number
  ): Promise<MongoDoctor>;
  getUserProfile(id: string): Promise<User | null>;
  getDoctorAppointments(
    id: string,
    page: number,
    limit: number
  ): Promise<IAppointment[] | null>;
  getUserAppointments(
    id: string,
    page: number,
    limit: number
  ): Promise<IAppointment[]>;
  getDoctorCount(): Promise<{
    doctorCount: number;
    unverifiedDoctorCount: number;
  }>;
  getTodaysRefunds(): Promise<{ total: number; count: number }>;
  getTodaysWithdrawals(): Promise<{ total: number; count: number }>;
  getWeeklyRefunds(): Promise<{ total: number; count: number }>;
  getWeeklyWithdrawals(): Promise<{ total: number; count: number }>;
  getMonthlyRefunds(): Promise<{ total: number; count: number }>;
  getMonthlyWithdrawals(): Promise<{ total: number; count: number }>;
  getYearlyRefunds(): Promise<{ total: number; count: number }>;
  getYearlyWithdrawals(): Promise<{ total: number; count: number }>;
  getRefundsList(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<{
    count: number;
    RefundList: {
      _id: mongoose.Types.ObjectId;
      date: Date;
      userName: string;
      cancelledBy: string;
      amount: string;
    }[];
  }>;
  getWithdrawalList(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<{
    withdrawalList?: {
      name: string;
      date: Date;
      email: string;
      amount: number;
    }[];
    count?: number;
  }>;
  getRefundDetail(id: string): Promise<{
    _id: Types.ObjectId;
    docName: string;
    userName: string;
    docImg: string;
    userImg: string;
    cancelledBy: string;
    appointmentTime: Date;
    appointmentBookedTime: Date;
    reason: string;
    amount: string;
    cancellationTime:Date
  }>;
}
export default IAdminRepository