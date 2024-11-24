import { Types } from "mongoose";
import IUserRepository from "../../entities/irepositories/iuserRepository";
import IuserAuthInteractor from "../../entities/iuse_cases/user/iAuth";
import { User } from "../../entities/rules/user";
import { IJwtService } from "../../entities/services/jwtServices";
import { IMailer } from "../../entities/services/mailer";
import bcrypt from "bcryptjs";
import AppError from "../../frameworks/express/functions/customError";

class UserAuthInteractor implements IuserAuthInteractor {
  constructor(
    private readonly Repository: IUserRepository,
    private readonly Mailer: IMailer,
    private readonly JWTServices: IJwtService
  ) {}
  async otpSignup(
    user: User
  ): Promise<{ status: true | false; message?: string; token?: string }> {
    try {
      const exist = await this.Repository.userExist(user.email);
      if (exist) throw new AppError("User Already Exist", 409);
      const mailResponse = await this.Mailer.sendMail(user.email);
      if (!mailResponse.success) throw new AppError("Error Sending Mail", 500);
      user.otp = mailResponse.otp;
      user.password = await bcrypt.hash(user.password, 10);
      const response = await this.Repository.tempOtpUser(user);
      const tempToken = this.JWTServices.generateToken(
        {
          emailId: user.email,
          userId: response.userId,
          role: "user",
          verified: false,
        },
        { expiresIn: "10m" }
      );
      return {
        status: true,
        message: "otp sucessfully sent",
        token: tempToken,
      };
    } catch (error) {
      if (error && error instanceof Error) {
        throw new AppError(error.message || "Internal Server Error", 500);
      } else {
        throw new AppError("Internal Server Error", 500);
      }
    }
  }
  async verifyOtpSignup(otp: string): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    userId?: any;
    name?: string;
  }> {
    try {
      const response = await this.Repository.createUserOtp(otp);
      if (!response.status) throw new AppError("Invalid Otp", 400);
      const accessToken = this.JWTServices.generateToken(
        {
          emailId: response.user.email,
          userId: response.user._id,
          role: "user",
          verified: true,
        },
        { expiresIn: "1h" }
      );
      const refreshToken = this.JWTServices.generateRefreshToken(
        {
          emailId: response.user.email,
          role: "user",
          userId: response.user._id,
          verified: true,
        },
        { expiresIn: "1d" }
      );

      return {
        status: true,
        accessToken,
        refreshToken,
        userId: response.user._id,
        name: response.user.name,
      };
    } catch (error) {
      if (error && error instanceof Error) {
        throw new AppError(error.message || "Internal Server Error", 500);
      } else {
        throw new AppError("Internal Server Error", 500);
      }
    }
  }
  async login(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    userId?: string;
    name?: string;
  }> {
    try {
      const userExist = await this.Repository.getUser(email);

      if (userExist?.register === "Google") {
        throw new AppError("Use Google Login", 400);
      }

      if (!userExist) {
        throw new AppError("Person not found", 404);
      }

      const hashedPassword = userExist.password;
      const match = await bcrypt.compare(password, hashedPassword);

      if (!match) {
        throw new AppError("Wrong password", 401);
      }

      if (userExist.isBlocked) {
        throw new AppError("Sorry, User Blocked", 403);
      }

      const accessToken = this.JWTServices.generateToken(
        {
          emailId: userExist.email,
          userId: userExist._id,
          role: "user",
          verified: true,
        },
        { expiresIn: "1h" }
      );

      const refreshToken = this.JWTServices.generateRefreshToken(
        {
          emailId: userExist.email,
          userId: userExist._id,
          role: "user",
          verified: true,
        },
        { expiresIn: "1d" }
      );

      return {
        status: true,
        accessToken,
        refreshToken,
        message: "Logged in successfully",
        userId: userExist._id as string,
        name: userExist.name,
      };
    } catch (error) {
      if (error && error instanceof Error) {
        throw new AppError(error.message || "Internal Server Error", 500);
      } else {
        throw new AppError("Internal Server Error", 500);
      }
    }
  }

  async googleLogin(
    name: string,
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errorCode?: string;
    name?: string;
    userId?: Types.ObjectId;
  }> {
    try {
      const userExist = await this.Repository.getUser(email);
      if (!userExist) {
        password = await bcrypt.hash(password, 10);

        const response = await this.Repository.googleSignup(
          email,
          name,
          password
        );

        const accessToken = this.JWTServices.generateToken(
          {
            emailId: email,
            role: "user",
            userId: response._id,
            verified: true,
          },
          { expiresIn: "1h" }
        );
        const refreshToken = this.JWTServices.generateRefreshToken(
          {
            emailId: email,
            role: "user",
            userId: response._id,
            verified: true,
          },
          { expiresIn: "1d" }
        );

        return {
          status: true,
          accessToken,
          refreshToken,
          message: "Signed Up Sucessfully",
          name: response.name,
          userId: response._id as Types.ObjectId,
        };
      }
      const hashedPassword = userExist?.password;
      const match = await bcrypt.compare(password, hashedPassword as string);
      if (!match) throw new AppError("Invalid Credentials", 400);
      if (userExist?.isBlocked) throw new AppError("Sorry, User Blocked", 403);

      const accessToken = this.JWTServices.generateToken(
        {
          emailId: userExist?.email,
          userId: userExist?._id,
          role: "user",
          verified: true,
        },
        { expiresIn: "1h" }
      );
      const refreshToken = this.JWTServices.generateRefreshToken(
        {
          emailId: userExist?.email,
          userId: userExist?._id,
          role: "user",
          verified: true,
        },
        { expiresIn: "1d" }
      );

      return {
        status: true,
        accessToken,
        refreshToken,
        message: "logged in Sucessfully",
        name: userExist?.name,
        userId: userExist?._id as Types.ObjectId,
      };
    } catch (error) {
      if (error && error instanceof Error) {
        throw new AppError(error.message || "Internal Server Error", 500);
      } else {
        throw new AppError("Internal Server Error", 500);
      }
    }
  }
  async resendOtp(
    email: string
  ): Promise<{ status: boolean; message?: string; errorCode?: string }> {
    try {
      const mailResponse = await this.Mailer.sendMail(email);
      if (!mailResponse.success) throw new AppError("Error Sending Mail", 500);
      const otp = mailResponse.otp;
      const response = await this.Repository.resendOtp(otp, email);
      if (!response) throw new AppError("Retry Signup", 400);
      return { status: true, message: "otp sucessfully sent" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export default UserAuthInteractor;
