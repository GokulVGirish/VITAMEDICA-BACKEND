import { Request, Response, NextFunction } from "express";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";
import IDoctorWalletInteractor from "../../../entities/iuse_cases/doctor/iwallet";

class DoctorWalletControllers {
  constructor(private readonly interactor: IDoctorWalletInteractor) {}
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
  async withdrawFromWallet(req:Request,res:Response,next:NextFunction){
    try{
       const docId = (req as doctorDataRequest).doctorData._id;
       const amount=req.params.amount
       const response=await this.interactor.withdrawFromWallet(docId,amount)
    if(response) return res.status(200).json({success:true,message:"Withdrawal Success"})
      return res.status(500).json({success:false,message:"Try Again After Some Time"})

    }
    catch(error){
      console.log(error)
      next(error)
      
    }
  }
}
export default DoctorWalletControllers