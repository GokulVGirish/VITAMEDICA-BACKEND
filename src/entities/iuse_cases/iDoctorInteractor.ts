import { MongoDoctor, OtpDoctor } from "../rules/doctor";
import MongoDepartment from "../rules/departments";
import { MulterFile } from "../rules/multerFile";
import { promises } from "dns";
import { ObjectId, Types } from "mongoose";
import { DoctorSlots } from "../rules/slotsType";
import { IDoctorWallet } from "../rules/doctorWalletType";
import IAppointment from "../rules/appointments";
import { Type } from "@aws-sdk/client-s3";
export interface IDoctorInteractor {
  otpSignup(doctor: OtpDoctor): Promise<{
    status: true | false;
    message?: string;
    token?: string;
    errorCode?: string;
  }>;
  verifyOtpSignup(otp: string): Promise<{
    status: true | false;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    doctor?: string;
    docstatus?: string;
  }>;
  login(
    email: string,
    password: string
  ): Promise<{
    status: true | false;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    errorCode?: string;
    doctor?: string;
    doctorStatus?: string;
    doctorId?: Types.ObjectId;
  }>;
  uploadFileToS3(
    bucketName: string,
    key: string,
    file: MulterFile
  ): Promise<void>;
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  documentsUpload(
    docId: string,
    file1: MulterFile,
    file2: MulterFile,
    file3: MulterFile,
    file4: MulterFile
  ): Promise<{ status: boolean }>;
  resendOtp(
    email: string
  ): Promise<{ status: boolean; message?: string; errorCode?: string }>;
  getProfile(image: string): Promise<{ url: string | null }>;
  profileUpdate(
    data: any,
    userId: Types.ObjectId,
    email: string
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    data?: MongoDoctor;
  }>;
  updateProfileImage(
    id: Types.ObjectId,
    image: MulterFile
  ): Promise<{ status: boolean; imageData?: string }>;
  addSlots(
    id: Types.ObjectId,
    data: DoctorSlots
  ): Promise<{ status: boolean; message: string; errorCode?: string }>;
  getWalletDetails(
    page: number,
    limit: number,
    docId: Types.ObjectId
  ): Promise<{
    status: boolean;
    doctorWallet?: IDoctorWallet;
    message: string;
    totalPages?: number;
  }>;
  getTodaysAppointments(docId: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
  }>;
  getUpcommingAppointments(
    docId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  getAvailableDate(
    id: Types.ObjectId
  ): Promise<{ status: boolean; message: string; dates?: string[] }>;
  getTimeSlots(
    id: Types.ObjectId,
    date: string
  ): Promise<{ status: boolean; message: string; slots?: DoctorSlots }>;
  deleteUnbookedSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<{ status: boolean; message: string }>;
  deleteBookedTimeSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date,
    reason: string
  ): Promise<{ status: boolean; message: string }>;
  getAppointmentDetail(
    id: string
  ): Promise<{ status: boolean; message?: string; detail?: IAppointment }>;
  addPrescription(
    appointmentId: string,
    prescription: MulterFile
  ): Promise<{ status: boolean; message: string }>;
  passwordResetLink(
    email: string
  ): Promise<{ status: boolean; message: string; link?: string }>;
  resetPassword(
    token: string,
    password: string
  ): Promise<{ status: boolean; message: string }>;
  getYearlyRevenue(id: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    dataYearly?: { _id: number; totalRevenue: number }[];
    dataMonthly?: {
      month: string;
      totalRevenue: number;
    }[];
    weeklyCount?: { appointmentsCount: number; cancellationsCount: number };
    monthlyCount?: { appointmentsCount: number; cancellationsCount: number };
  }>;
}
