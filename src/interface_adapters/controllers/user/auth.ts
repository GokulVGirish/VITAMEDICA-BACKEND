import { Request, Response, NextFunction } from "express";
import { CustomRequestType } from "../../../frameworks/express/middlewares/role-Authenticate";
import IuserAuthInteractor from "../../../entities/iuse_cases/user/iAuth";
import AppError from "../../../frameworks/express/functions/customError";

class UserAuthControllers {
  constructor(private readonly interactor: IuserAuthInteractor) {}
  async otpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const response = await this.interactor.otpSignup(body);

      res.status(200).json({
        success: true,
        message: response.message,
        token: response.token,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
  async verifyOtpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;
      const response = await this.interactor.verifyOtpSignup(otp);

      res.cookie("accessToken", response.accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        domain: process.env.cors_origin,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });
      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        maxAge: 604800*1000,
        domain: process.env.cors_origin,
        secure:process.env.NODE_ENV==="production",
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({
        success: true,
        message: "Signed Up Sucessfully",
        userId: response.userId,
        name: response.name,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await this.interactor.login(email, password);

      res.cookie("accessToken", response.accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });
      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        maxAge: 604800 * 1000,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: response.message || "Logged in successfully",
        userId: response.userId,
        name: response.name,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, message: "token verified" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, sub, name } = req.body;

      const response = await this.interactor.googleLogin(name, email, sub);

      res.cookie("accessToken", response.accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        maxAge: 604800 * 1000,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: response.message,
        name: response.name,
        userId: response.userId,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const emailId = (req as CustomRequestType).user.emailId;

      const response = await this.interactor.resendOtp(emailId as string);

      res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ success: "LoggedOut Sucessfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default UserAuthControllers;
