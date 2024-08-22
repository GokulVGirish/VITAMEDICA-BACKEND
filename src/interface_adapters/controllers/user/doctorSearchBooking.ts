import { IUserInteractor } from "../../../entities/iuse_cases/iuserInteractor";
import { Request, Response, NextFunction } from "express";


class DoctorSearchBookingControllers {
  constructor(private readonly interactor: IUserInteractor) {}
  async getDoctorList(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const skip = (page - 1) * limit;

      const response = await this.interactor.getDoctorsList(skip, limit);
      if (response.status)
        return res
          .status(200)
          .json({
            success: true,
            message: response.message,
            doctors: response.doctors,
            totalPages: response.totalPages,
          });
      else res.status(500).json({ success: false, message: response.message });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getDoctorPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const response = await this.interactor.getDoctorPage(id);
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            doctor: response.doctor,
          });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getAvailableDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId } = req.params;

      const response = await this.interactor.getAvailableDate(doctorId);
      if (response.status) {
        res
          .status(200)
          .json({
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
    }
  }
  async getTimeSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date;
      const id = req.params.doctorId;
      const response = await this.interactor.getTimeSlots(id, date as string);
      if (response.status) {
        res
          .status(200)
          .json({
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
  async getDoctorsByDepartment(req:Request,res:Response,next:NextFunction){
    try{

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const skip = (page - 1) * limit;
      const category=req.query.category
      console.log("category",category,page,limit)
      const response=await this.interactor.getDoctorsByCategory(category as string,skip,limit)
      if (response.status)
        return res.status(200).json({
          success: true,
          message: response.message,
          doctors: response.doctors,
          totalPages: response.totalPages,
        });
      else res.status(500).json({ success: false, message: response.message });


    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
  async getDoctorBySearch(req:Request,res:Response,next:NextFunction){
    try{
      const search=req.query.search
      const response=await this.interactor.getDoctorBySearch(search as string)
      if(response.status) return res.status(200).json({success:true,message:response.message,doctors:response.doctors})
        res.status(404).json({success:false,message:response.message})


    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
}
export default DoctorSearchBookingControllers