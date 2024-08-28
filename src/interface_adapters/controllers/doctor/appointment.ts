import { Request, Response, NextFunction } from "express";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";
import { MulterFile } from "../../../entities/rules/multerFile";
import IDoctorAppointmentInteractor from "../../../entities/iuse_cases/doctor/iAppointment";



class DoctorAppointmentControllers {
  constructor(private readonly interactor: IDoctorAppointmentInteractor) {}
  async todaysAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.getTodaysAppointments(docId);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          appointments: response.appointments,
        });
      } else {
        res.status(404).json({ status: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getUpcommingAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 7;
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.getUpcommingAppointments(
        docId,
        page,
        limit
      );
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          appointments: response.appointments,
          totalPages: response.totalPages,
        });
      } else {
        res.status(404).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getAppointmentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const response = await this.interactor.getAppointmentDetail(id);
      if (response.status) {
        return res.status(200).json({
          success: true,
          message: response.message,
          detail: response.detail,
        });
      }
      res.status(500).json({ success: false, message: response.message });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async addPrescription(req: Request, res: Response, nex: NextFunction) {
    try {
      const appointmentId = req.params.appointmentId;
      const response = await this.interactor.addPrescription(
        appointmentId,
        req.file as MulterFile
      );
      if (response.status)
        return res
          .status(200)
          .json({ success: true, message: response.message });
      return res
        .status(500)
        .json({ success: false, message: response.message });
    } catch (error) {
      console.log(error);
      nex(error);
    }
  }
}
export default DoctorAppointmentControllers