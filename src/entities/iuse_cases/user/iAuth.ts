import { User } from "../../rules/user";



interface IuserAuthInteractor {
  otpSignup(
    user: User
  ): Promise<{ status: true | false; message?: string; token?: string }>;
  verifyOtpSignup(
    otp: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    userId?: any;
    name?: string;
  }>;
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
}
export default IuserAuthInteractor