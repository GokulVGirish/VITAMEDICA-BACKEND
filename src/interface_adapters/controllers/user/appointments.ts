import { Request, Response, NextFunction } from "express";
import userDataRequest from "../../../frameworks/express/middlewares/user";
import { Types } from "mongoose";
import IUserAppointmentInteractor from "../../../entities/iuse_cases/user/iAppointments";



class UserAppointmentControllers {
  constructor(private readonly interactor: IUserAppointmentInteractor) {}
  async razorPayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("inside");
      const body = req.body;
      const response = await this.interactor.razorPayOrderGenerate(
        body.amount,
        body.currency,
        body.receipt
      );
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          order: response.order,
        });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      next(error);
    }
  }
  async razorPayValidate(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        docId,
        slotDetails,
        fees,
      } = req.body;
      const userId = (req as userDataRequest).userData._id;
      const response = await this.interactor.razorPayValidateBook(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        docId,
        slotDetails,
        userId as Types.ObjectId,
        fees,
      );
      console.log("response", response);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          appointment: response.appointment,
        });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      next(error);
      throw error;
    }
  }
  async bookFromWallet(req:Request,res:Response,next:NextFunction){
    try{
      const { docId, slotDetails ,fees} = req.body;
          const userId = (req as userDataRequest).userData._id;
      const response=await this.interactor.bookFromWallet(userId as Types.ObjectId,docId,slotDetails,fees)
        if (response.status) {
          res.status(200).json({
            success: true,
            message: response.message,
            appointment: response.appointment,
          });
        } else {
          res.status(400).json({ success: false, message: response.message });
        }

    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
  async lockSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, date, slotId } = req.body;
      console.log("docId", doctorId, "date", date, "slotId", slotId);
      const usertId = (req as userDataRequest).userData._id;
      const response = await this.interactor.lockSlot(
        usertId as Types.ObjectId,
        doctorId,
        date,
        slotId
      );
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      next(error);
      throw error;
    }
  }
  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as userDataRequest).userData._id;
      const response = await this.interactor.getAppointments(
        page,
        limit,
        userId as Types.ObjectId
      );
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          appointments: response.appointments,
          totalPage: response.totalPages,
        });
      } else {
        res.status(404).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAppointmentDetail(req:Request,res:Response,next:NextFunction){
    try{
          const appointmentId = req.params.appointmentId;
          const response=await this.interactor.getAppointmentDetail(appointmentId)
          if(response.status) return res.status(200).json({success:true,message:response.message,data:response.appointmentDetail,messages:response.messages})
            return res
              .status(500)
              .json({
                success: false,
                message: response.message,
              });


    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
  async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as userDataRequest).userData._id;
      const appointmentId = req.params.appointmentId;
      const date = new Date(req.query.date as string);
      const startTime = new Date(req.query.startTime as string);
      const reason=req.body.reason
      console.log('reason of user',reason)
      const response = await this.interactor.cancelAppointment(
        userId as Types.ObjectId,
        appointmentId,
        date,
        startTime
        ,reason
      );
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { docId, rating, description } = req.body;
      const appointmentId = req.params.appointmentId;
      const userId = (req as userDataRequest).userData._id;
      console.log(
        "docid",
        docId,
        "rating",
        rating,
        "description",
        description,
        "apppin",
        appointmentId,
        "userId",
        userId
      );
      const response = await this.interactor.addReview(
        appointmentId,
        userId as Types.ObjectId,
        docId,
        rating,
        description
      );
      if (response.status)
        return res
          .status(200)
          .json({ success: true, message: response.message });
      return res
        .status(500)
        .json({ success: false, message: response.message });
    } catch (error) {
      next(error);
    }
  }
  async medicalRecordsUpload(req:Request,res:Response,next:NextFunction){
    try{
        const appointmentId = req.params.appointmentId;
        const files = req.files as Express.Multer.File[];
        const response= await this.interactor.medicalRecordUpload(appointmentId,files)
        if(response) return res.status(200).json({success:true,message:"success"})
          res.status(500).json({success:false,message:"filed to upload"})

    }catch(error){
      console.log(error)
      next(error)
    }

  }
}
export default UserAppointmentControllers