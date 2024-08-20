import { IUserInteractor } from "../../../entities/iuse_cases/iuserInteractor";
import { Request,Response,NextFunction } from "express";
import { CustomRequestType } from "../../../frameworks/express/middlewares/role-Authenticate";




class UserAuthControllers {
  constructor(private readonly interactor: IUserInteractor) {}
  async otpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const response = await this.interactor.otpSignup(body);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token,
        });
      } else {
        res.status(200).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log("otpsignup", error);
      next(error);
    }
  }
  async verifyOtpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;
      const response = await this.interactor.verifyOtpSignup(otp);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: "signed Up Sucessfully",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "invalid otp Entered" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await this.interactor.login(email, password);

      if (response.status) {
        res.status(200).json({
          success: true,
          message: "logged in Sucessfully",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          userId: response.userId,
          name: response.name,
        });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
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
  async googleSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, sub } = req.body;

      const response = await this.interactor.googleSignup(email, name, sub);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        switch (response.errorCode) {
          case "USER_EXIST":
            res.status(409).json({ status: false, message: response.message });
            break;
          case "SERVER_ERROR":
            res.status(500).json({ status: false, message: response.message });
            break;
          default:
            res.status(400).json({ success: false, message: response.message });
            break;
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, sub } = req.body;
      console.log(req.body);
      const response = await this.interactor.googleLogin(email, sub);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: "logged in Sucessfully",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        switch (response.errorCode) {
          case "NO_USER":
            return res
              .status(404)
              .json({ success: false, message: response.message });
          case "INCORRECT_PASSWORD":
            return res
              .status(401)
              .json({ success: false, message: response.message });
          case "BLOCKED":
            return res
              .status(403)
              .json({ success: false, message: response.message });
          default:
            return res
              .status(400)
              .json({ success: false, message: response.message });
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const emailId = (req as CustomRequestType).user.emailId;
      console.log("email", emailId);
      const response = await this.interactor.resendOtp(emailId as string);
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

export default UserAuthControllers