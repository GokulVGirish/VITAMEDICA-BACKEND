import IAdminAuthInteractor from "../../../entities/iuse_cases/admin/iAuth";
import { Request, Response, NextFunction } from "express";

class AdminAuthControllers {
  constructor(private readonly interactor: IAdminAuthInteractor) {}
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await this.interactor.adminLogin(email, password);
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            adminAccessToken: response.adminAccessToken,
            adminRefreshToken: response.adminRefreshToken,
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
}
export default AdminAuthControllers