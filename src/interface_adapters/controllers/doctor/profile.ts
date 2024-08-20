import { IDoctorInteractor } from "../../../entities/iuse_cases/iDoctorInteractor";
import { Request, Response, NextFunction } from "express";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";
import { MulterFile } from "../../../entities/rules/multerFile";





class DoctorProfileControllers {
  constructor(private readonly interactor: IDoctorInteractor) {}
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      (req as doctorDataRequest).doctorData.password = "**********";
      const response = await this.interactor.getProfile(
        (req as doctorDataRequest).doctorData.image as string
      );
      (req as doctorDataRequest).doctorData.image = response.url;

      res.status(200).json({
        success: true,
        doctorData: (req as doctorDataRequest).doctorData,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async UpdateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("here", req.file);
      const emailId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.updateProfileImage(
        emailId,
        req.file as MulterFile
      );
      console.log("sraae", response.status);
      if (response.status) {
        res.status(200).json({ success: true, imageData: response.imageData });
      } else {
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async DoctorProfileUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const emailId = (req as doctorDataRequest).doctorData.email;
      const response = await this.interactor.profileUpdate(
        req.body,
        docId,
        emailId
      );
      if (response.status) {
        res.status(200).json({
          success: true,
          data: response.data,
          message: response.message,
        });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export default DoctorProfileControllers