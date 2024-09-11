import { Request, Response, NextFunction } from "express";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";
import { MulterFile } from "../../../entities/rules/multerFile";
import IDoctorProfileInteractor from "../../../entities/iuse_cases/doctor/iProfile";





class DoctorProfileControllers {
  constructor(private readonly interactor: IDoctorProfileInteractor) {}
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
  async passwordResetLink(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      const response = await this.interactor.passwordResetLink(email);
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
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;
      const password = req.body.password;
      const response = await this.interactor.resetPassword(token, password);
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
  async fetchNotificationCount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.fetchNotificationCount(docId);
      res.status(200).json({ count: response });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async fetchNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.fetchNotifications(docId);
      res.status(200).json({ notifications: response });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async markNotificationAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.markNotificationAsRead(docId);
      if (response)
        return res.status(200).json({ success: true, message: "Success" });
      res.status(500).json({ success: false, message: "Something went wrong" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async isProfileCompleted(req: Request, res: Response, next: NextFunction) {
    try {
      const isComplete = (req as doctorDataRequest).doctorData.complete
      res.status(200).json({success:true,message:"Complete Your Profile To Add Slots",isComplete})


    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default DoctorProfileControllers