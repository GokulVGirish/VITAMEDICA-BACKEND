import IAdminAuthInteractor from "../../../entities/iuse_cases/admin/iAuth";
import { Request, Response, NextFunction } from "express";

class AdminAuthControllers {
  constructor(private readonly interactor: IAdminAuthInteractor) {}
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await this.interactor.adminLogin(email, password);
      if (response.status) {
        res.cookie("accessToken", response.adminAccessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "strict",
        });
        res.cookie("refreshToken", response.adminRefreshToken, {
          httpOnly: true,
          maxAge: 604800 * 1000,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "strict",
        });
        res.status(200).json({
          success: true,
          message: "logged in sucessfully",
        });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, message: "token verified" });
    } catch (error) {
      console.log(error);
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
export default AdminAuthControllers;
