import { Request, Response, NextFunction } from "express";
import { IAdminInteractor } from "../../../entities/iuse_cases/iAdminInteractor";

class AdminUserManagementControllers {
  constructor(private readonly interactor: IAdminInteractor) {}
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.interactor.getUsers();
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            users: response.users,
          });
      } else {
        res.status(500).json({
          success: true,
          message: response.message,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async blockUnblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const status = req.params.status;
      const response = await this.interactor.blockUnblockUser(userId, status);
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default AdminUserManagementControllers
