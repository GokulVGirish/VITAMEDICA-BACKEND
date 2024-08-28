import { Types } from "mongoose";
import { OtpDoctor } from "../../rules/doctor";


interface IDoctorAuthInteractor {
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
  resendOtp(
    email: string
  ): Promise<{ status: boolean; message?: string; errorCode?: string }>;
}
export default IDoctorAuthInteractor