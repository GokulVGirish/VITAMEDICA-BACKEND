import { IDoctorInteractor } from "../../../entities/iuse_cases/iDoctorInteractor";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";
import { Request, Response, NextFunction } from "express";


class DoctorSlotsControllers {
  constructor(private readonly interactor: IDoctorInteractor) {}

  async addSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { _id } = (req as doctorDataRequest).doctorData;
      const response = await this.interactor.addSlots(_id, req.body);
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAvailableDates(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const response = await this.interactor.getAvailableDate(docId);

      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          dates: response.dates,
        });
      } else {
        res.status(404).json({
          success: false,
          message: response.message,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getTimeSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const date = req.query.date;
      const response = await this.interactor.getTimeSlots(
        docId,
        date as string
      );
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          slots: response.slots,
        });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async deleteUnbookedTimeSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const date = new Date(req.query.date as string);
      const startTime = new Date(req.query.startTime as string);
      const response = await this.interactor.deleteUnbookedSlots(
        docId,
        date,
        startTime
      );
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
  async deleteBookedTimeSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = (req as doctorDataRequest).doctorData._id;
      const date = new Date(req.query.date as string);
      const startTime = new Date(req.query.startTime as string);

      const response = await this.interactor.deleteBookedTimeSlots(
        docId,
        date,
        startTime
      );
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
      console.log("manhhhh");
    }
  }
}

export default DoctorSlotsControllers