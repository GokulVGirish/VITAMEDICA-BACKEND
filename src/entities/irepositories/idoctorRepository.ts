import { MongoDoctor, OtpDoctor } from "../rules/doctor"
import MongoDepartment from "../rules/departments";
import { ObjectId, Types } from "mongoose";
import { RejectedDoctor } from "../rules/rejectedDoctor";
import { DoctorSlots } from "../rules/slotsType";
import { IDoctorWallet } from "../rules/doctorWalletType";
import IAppointment from "../rules/appointments";


export interface IDoctorRepository {
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  tempOtpDoctor(data: OtpDoctor): Promise<{ userId: Types.ObjectId }>;
  doctorExists(email: string): Promise<null | MongoDoctor>;
  createDoctorOtp(
    otp: string
  ): Promise<{ status: boolean; message: string; doctor?: MongoDoctor }>;
  getDoctor(email: string): Promise<MongoDoctor | null>;
  docStatusChange(id: string, status: string): Promise<void>;

  documentsUpdate(
    docId: string,
    key1: string,
    key2: string,
    key3: string,
    key4: string
  ): Promise<void>;
  resendOtp(otp: string, email: string): Promise<boolean>;
  updateProfileImage(id: Types.ObjectId, imagePath: string): Promise<boolean>;
  profileUpdate(
    id: Types.ObjectId,
    data: {
      name: string;
      phone: string;
      description: string;
      fees: string;
      degree: string;
    }
  ): Promise<boolean>;
  getRejectedDoctor(email: string): Promise<RejectedDoctor | null>;
  createSlot(id: Types.ObjectId, data: DoctorSlots): Promise<boolean>;
  getSlot(date: Date, id: Types.ObjectId): Promise<DoctorSlots | null>;
  getWalletDetails(
    page: number,
    limit: number,
    docId: Types.ObjectId
  ): Promise<{
    status: boolean;
    doctorWallet?: IDoctorWallet;
    totalPages?: number;
  }>;
  getTodaysAppointments(docId: Types.ObjectId): Promise<IAppointment[] | null>;
  getUpcommingAppointments(
    docId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{
    status: boolean;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  getAvailableDate(id: Types.ObjectId): Promise<DoctorSlots[] | null>;
  getTimeSlots(id: Types.ObjectId, date: string): Promise<DoctorSlots | null>;
  deleteSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<boolean>;
  cancelAppointment(
    id: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<{
    status: boolean;
    amount?: string;
    id?: Types.ObjectId;
    userId?: Types.ObjectId;
  }>;
  doctorWalletUpdate(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    type: string,
    reason: string,
    paymentMethod: string
  ): Promise<boolean>;
  userWalletUpdate(
    userId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    type: string,
    reason: string,
    paymentMethod: string
  ): Promise<boolean>;

  createCancelledAppointment(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    cancelledBy: string
  ): Promise<boolean>;
  getAppointmentDetail(
    id: string
  ): Promise<IAppointment|null>;
  addPrescription(appointmentId:string,prescription:string):Promise<boolean>
}