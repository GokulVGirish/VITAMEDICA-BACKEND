import IAppointment from "../rules/appointments";
import { MongoDoctor, Review } from "../rules/doctor";
import { DoctorSlots } from "../rules/slotsType";
import { User } from "../rules/user"
import { MongoUser } from "../rules/user"
import { Types } from "mongoose"
import IUserWallet from "../rules/userWalletType";
import { promises } from "dns";
import { INotificationContent } from "../rules/Notifications";

interface IUserRepository {
  tempOtpUser(data: User): Promise<{ userId: Types.ObjectId }>;
  userExist(email: string): Promise<boolean>;
  createUserOtp(otp: string): Promise<{ status: boolean; user?: any }>;
  getUser(email: string): Promise<MongoUser | null>;
  googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<MongoUser>;
  resendOtp(otp: string, email: string): Promise<boolean>;
  updateProfile(id: Types.ObjectId, data: User): Promise<{ success: boolean }>;
  updateProfileImage(id: Types.ObjectId, imagePath: string): Promise<boolean>;
  resetPassword(email: string, password: string): Promise<boolean>;
  getDoctors(
    skip: number,
    limit: number
  ): Promise<{ doctors?: MongoDoctor[]; totalPages?: number }>;
  getDoctor(id: string): Promise<MongoDoctor | null>;
  getSlots(id: string): Promise<DoctorSlots[] | null>;
  getTimeSlots(id: string, date: string): Promise<DoctorSlots | null>;
  lockSlot(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: string,
    slotId: Types.ObjectId,
    lockExpiration: Date
  ): Promise<boolean>;
  bookSlot(
    doctorId: Types.ObjectId,
    userId: Types.ObjectId,
    slotId: Types.ObjectId,
    date: string
  ): Promise<boolean>;
  createAppointment(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: string,
    start: string,
    end: string,
    amount: string,
    fees: string,
    paymentMethod: string,
    paymentId?: string
  ): Promise<IAppointment>;
  doctorWalletUpdate(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: number,
    type: string,
    reason: string
  ): Promise<boolean>;
  getAppointments(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  userWalletInfo(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    userWallet?: IUserWallet;
    totalPages?: number;
  }>;
  cancelAppointment(
    appointmentId: string,
    reason: string
  ): Promise<{ status: boolean; amount?: string; docId?: Types.ObjectId }>;
  unbookSlot(
    docId: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<boolean>;
  userWalletUpdate(
    userId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: number,
    type: string,
    reason: string
  ): Promise<boolean>;
  createCancelledAppointment(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    cancelledBy: string,
    reason: string
  ): Promise<boolean>;
  getAppointment(appoinmentId: string): Promise<IAppointment | null>;
  addReview(
    appointmentId: string,
    userId: Types.ObjectId,
    docId: string,
    rating: number,
    description?: string
  ): Promise<boolean>;
  getDoctorsByCategory(
    category: string,
    skip: number,
    limit: number
  ): Promise<{ doctors?: MongoDoctor[]; totalPages?: number }>;
  getDoctorBySearch(searchKey: RegExp): Promise<MongoDoctor[] | null>;
  fetchDoctorRating(
    id: string,
    page: number,
    limit: number
  ): Promise<{
    _id: Types.ObjectId;
    name: string;
    email: string;
    averageRating: number;
    totalReviews: number;
    latestReviews: Review[];
  }>;
  fetchFavoriteDoctors(id: Types.ObjectId): Promise<[Types.ObjectId]>;
  removeDoctorFavorites(
    userId: Types.ObjectId,
    docId: string
  ): Promise<boolean>;
  addDoctorFavorites(userId: Types.ObjectId, docId: string): Promise<boolean>;
  getFavoriteDoctorsList(
    userId: Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }>;
  addUserReviewToAppointment(
    appointmentId: string,
    rating: number,
    description?: string
  ): Promise<boolean>;
  getMessages(
    id: string
  ): Promise<
    { sender: string; message: string; type: string; createdAt: Date }[]
  >;
  medicalRecordUpload(appointmentId: string, files: string[]): Promise<boolean>;
  fetchNotificationCount(userId: Types.ObjectId): Promise<number>;
  fetchNotifications(userId: Types.ObjectId): Promise<INotificationContent[]>;
  markNotificationAsRead(userId: Types.ObjectId): Promise<boolean>;
}
export default IUserRepository