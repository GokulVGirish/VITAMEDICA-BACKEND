import { MongoUser, User } from "../rules/user"
import { MulterFile } from "../rules/multerFile";
import { Types } from "mongoose";
import { MongoDoctor } from "../rules/doctor";
import { DoctorSlots } from "../rules/slotsType";
import { Slot } from "../rules/slotsType";
import IAppointment from "../rules/appointments";
import IUserWallet from "../rules/userWalletType";
export interface IUserInteractor {
  //   signup(user:User):Promise<{user:User|null}>;
  otpSignup(
    user: User
  ): Promise<{ status: true | false; message?: string; token?: string }>;
  verifyOtpSignup(
    otp: string
  ): Promise<{ status: boolean; accessToken?: string; refreshToken?: string }>;
  login(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    userId?: string;
    name?: string;
  }>;
  googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
  }>;
  googleLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
    name?: string;
  }>;
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
    data?: MongoUser;
  }>;
  updateProfileImage(
    id: Types.ObjectId,
    image: MulterFile
  ): Promise<{ status: boolean; imageData?: string }>;
  passwordResetLink(
    email: string
  ): Promise<{ status: boolean; message: string; link?: string }>;
  resetPassword(
    token: string,
    password: string
  ): Promise<{ status: boolean; message: string }>;
  getDoctorsList(
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }>;
  getDoctorPage(
    id: string
  ): Promise<{ status: boolean; message: string; doctor?: MongoDoctor }>;
  getAvailableDate(
    id: string
  ): Promise<{ status: boolean; message: string; dates?: string[] }>;
  getTimeSlots(
    id: string,
    date: string
  ): Promise<{ status: boolean; message: string; slots?: DoctorSlots }>;
  razorPayOrderGenerate(
    amount: string,
    currency: string,
    receipt: string
  ): Promise<{ status: boolean; order?: any; message: string }>;
  razorPayValidateBook(
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string,
    docId: Types.ObjectId,
    slotDetails: any,
    userId: Types.ObjectId,
    fees: string
  ): Promise<{ status: boolean; message?: string; appointment?: IAppointment }>;
  lockSlot(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: Date,
    slotId: Types.ObjectId
  ): Promise<{ status: boolean; message?: string; errorCode?: string }>;
  getAppointments(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  getWalletInfo(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    userWallet?: IUserWallet;
    message: string;
    totalPages?: number;
  }>;
  cancelAppointment(
    userId: Types.ObjectId,
    appointmentId: string,
    date: Date,
    startTime: Date,
    reason: string
  ): Promise<{ status: boolean; message: string }>;
  addReview(
    appointmentId: string,
    userId: Types.ObjectId,
    docId: string,
    rating: number,
    description?: string
  ): Promise<{ status: boolean; message: string }>;
  getDoctorsByCategory(
    category: string,
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }>;
  getDoctorBySearch(
    searchKey: string
  ): Promise<{ status: boolean; message: string; doctors?: MongoDoctor[] }>;
}