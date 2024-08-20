import { IDoctorInteractor } from "../../../entities/iuse_cases/iDoctorInteractor";
import { Request, Response, NextFunction } from "express";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";

class DoctorWalletControllers {
  constructor(private readonly interactor: IDoctorInteractor) {}
  async getWalletDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.getWalletDetails(
        page,
        limit,
        docId
      );

      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            walletDetail: response.doctorWallet,
            totalPages: response.totalPages,
          });
      } else {
        res.status(404).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
export default DoctorWalletControllers