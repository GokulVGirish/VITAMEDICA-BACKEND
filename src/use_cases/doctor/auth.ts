import { Types } from "mongoose";
import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import IDoctorAuthInteractor from "../../entities/iuse_cases/doctor/iAuth";
import { OtpDoctor } from "../../entities/rules/doctor";
import { IJwtService } from "../../entities/services/jwtServices";
import { IMailer } from "../../entities/services/mailer";
import bcrypt from "bcryptjs";



class DoctorAuthInteractor implements IDoctorAuthInteractor {
  constructor(
    private readonly Repository: IDoctorRepository,
    private readonly Mailer: IMailer,
    private readonly JWTServices: IJwtService
  ) {}
  async otpSignup(doctor: OtpDoctor): Promise<{
    status: true | false;
    message?: string;
    token?: string;
    errorCode?: string;
  }> {
    try {
      const exists = await this.Repository.doctorExists(doctor.email);
      if (!exists) {
        const mailResponse = await this.Mailer.sendMail(doctor.email);
        if (mailResponse.success) {
          doctor.otp = mailResponse.otp;
          doctor.password = await bcrypt.hash(doctor.password, 10);
          const response = await this.Repository.tempOtpDoctor(doctor);
          const tempToken = this.JWTServices.generateToken(
            {
              emailId: doctor.email,
              role: "doctor",
              userId: response.userId,
              verified: false,
            },
            { expiresIn: "10m" }
          );
          return {
            status: true,
            message: "otp sucessfully sent",
            token: tempToken,
          };
        } else {
          return {
            status: false,
            message: "error sending email",
            errorCode: "EMAIL_SEND_FAILURE",
          };
        }
      } else {
        return {
          status: false,
          message: "doctor already exist",
          errorCode: "DOCTOR_EXISTS",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyOtpSignup(otp: string): Promise<{
    status: true | false;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    doctor?: string;
    docstatus?: string;
    docId?:Types.ObjectId
  }> {
    try {
      const response = await this.Repository.createDoctorOtp(otp);
      if (response.status && response.doctor) {
        const accessToken = this.JWTServices.generateToken(
          {
            emailId: response.doctor.email,
            role: "doctor",
            userId: response.doctor._id,
            verified: true,
          },
          { expiresIn: "1h" }
        );
        const refreshToken = this.JWTServices.generateRefreshToken(
          {
            emailId: response.doctor.email,
            role: "doctor",
            userId: response.doctor._id,
            verified: true,
          },
          { expiresIn: "1d" }
        );
        return {
          status: true,
          message: "signed Up Sucessfully",
          accessToken,
          refreshToken,
          doctor: response.doctor?.name,
          docstatus: response.doctor?.status,
          docId:response.doctor._id
        };
      } else {
        return { status: false, message: response.message };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async login(
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
  }> {
    try {
      const rejectDoctor = await this.Repository.getRejectedDoctor(email);
      if (rejectDoctor)
        return {
          status: false,
          message: rejectDoctor.reason,
          errorCode: "VERIFICATION_FAILED",
        };
      const doctor = await this.Repository.getDoctor(email);
      if (!doctor) {
        return {
          status: false,
          message: "invalid doctor",
          errorCode: "INVALID_DOCTOR",
        };
      }
      if (doctor.isBlocked)
        return { status: false, message: "Sorry User Blocked" };
      const hashedPassword = doctor.password;
      const match = await bcrypt.compare(password, hashedPassword);
      if (!match) {
        return {
          status: false,
          message: "invalid password",
          errorCode: "INVALID_Password",
        };
      }
      const accessToken = this.JWTServices.generateToken(
        {
          emailId: doctor.email,
          role: "doctor",
          userId: doctor._id,
          verified: true,
        },
        { expiresIn: "1h" }
      );
      const refreshToken = this.JWTServices.generateRefreshToken(
        {
          emailId: doctor.email,
          role: "doctor",
          userId: doctor._id,
          verified: true,
        },
        { expiresIn: "1d" }
      );

      return {
        status: true,
        message: "logged in sucessfully",
        accessToken,
        refreshToken,
        doctor: doctor.name,
        doctorStatus: doctor.status,
        doctorId: doctor._id,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async resendOtp(
    email: string
  ): Promise<{ status: boolean; message?: string; errorCode?: string }> {
    try {
      const mailResponse = await this.Mailer.sendMail(email);
      if (!mailResponse.success) {
        return { status: false, message: "error sending email" };
      }
      const otp = mailResponse.otp;
      const response = await this.Repository.resendOtp(otp, email);
      if (response) {
        return { status: true, message: "otp sucessfully sent" };
      } else {
        return { status: false, message: "retry signup" };
      }
    } catch (error) {
      throw error;
    }
  }
}
export default DoctorAuthInteractor