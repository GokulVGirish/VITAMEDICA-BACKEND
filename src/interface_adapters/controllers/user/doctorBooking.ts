import { Request, Response, NextFunction } from "express";
import IDoctorBookingInteractor from "../../../entities/iuse_cases/user/iDoctorBooking";
import userDataRequest from "../../../frameworks/express/middlewares/user";
import { Types } from "mongoose";


class DoctorSearchBookingControllers {
  constructor(private readonly interactor: IDoctorBookingInteractor) {}
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
      const page=parseInt(req.query.page as string)||1
      const limit=parseInt(req.query.limit as string)||3
      const response = await this.interactor.getDoctorPage(id,page,limit);
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            doctor: response.doctor,
            reviews:response.reviews
          });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  async fetchMoreReviews(req:Request,res:Response,next:NextFunction){
    try{
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 3;
        const response=await this.interactor.fetchMoreReviews(id,page,limit)
            if (response.status) {
              res.status(200).json({
                success: true,
                message: response.message,
                reviews: response.reviews,
              });
            } else {
              res
                .status(500)
                .json({ success: false, message: response.message });
            }


    }
    catch(error){
      console.log(error)
      throw error
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
  async fetchFavoriteDoctors(req:Request,res:Response,next:NextFunction){
    try{
      const id=(req as userDataRequest).userData._id as Types.ObjectId
      const response=await this.interactor.fetchFavoriteDoctors(id)
      if(response.success)return res.status(200).json({success:true,message:response.message,favorites:response.favorites})
        return res.status(404).json({success:false,message:response.message})

    }
    catch(error){
      console.log(error)
      throw error
    }

  }
  async removeDoctorFavorites(req:Request,res:Response,next:NextFunction){
    try{
         const userId = (req as userDataRequest).userData._id as Types.ObjectId;
      const docId=req.params.id
      const response=await this.interactor.removeDoctorFavorites(userId,docId)
      if(response) return res.status(200).json({success:true})
        else return res.status(500).json({success:false})
    

    }
    catch(error){

      console.log(error)
      next(error)
    }

  }
  async addDoctorFavorites(req:Request,res:Response,next:NextFunction){
    try{
        const userId = (req as userDataRequest).userData._id as Types.ObjectId;
        const docId = req.params.id;
        const response=await this.interactor.addDoctorFavorites(userId,docId)
           if (response) return res.status(200).json({ success: true });
           else return res.status(500).json({ success: false });


    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
  async favoriteDoctorsList(req:Request,res:Response,next:NextFunction){
    try{
      const userId = (req as userDataRequest).userData._id as Types.ObjectId;
      const page=parseInt(req.query.page as string)||1
      const limit=parseInt(req.query.limit as string)||6
      const skip=(page-1)*limit
      const response=await this.interactor.getFavoriteDoctorsList(userId,skip,limit)
      if(response.status) return res.status(200).json({success:true,message:response.message,doctors:response.doctors,totalCount:response.totalPages})
        return res.status(404).json({success:false,message:response.message})
    }
    catch(error){
      console.log(error)
      next(error)
    }
  }
}
export default DoctorSearchBookingControllers