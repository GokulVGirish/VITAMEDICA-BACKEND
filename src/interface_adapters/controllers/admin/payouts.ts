import IAdminPayoutsInteractor from "../../../entities/iuse_cases/admin/iPayouts";
import { Request, Response, NextFunction } from "express";


class PayoutControllers{

    constructor(private readonly Interactor:IAdminPayoutsInteractor){

    }
    async getRefundsList(req:Request,res:Response,next:NextFunction){
         const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.limit as string) || 10;
         const startDate = req.query.startDate;
         const endDate = req.query.endDate;
        try{
         const response=await this.Interactor.getRefundsList(page,limit,startDate as string,endDate as string)
         if(response.status) return res.status(200).json({success:true,message:response.message,refundList:response.refundList,count:response.count})
            return res
              .status(404)
              .json({
                success: false,
                message: response.message
              });
       
          

        }
        catch(error){
            console.log(error)
            next(error)
            
        }
    }
    async getRefundDetail(req:Request,res:Response,next:NextFunction){
        try{

           const  id=req.params.id
           const response=await this.Interactor.getRefundDetail(id)
           if(response.status) return res.status(200).json({success:true,message:response.message,refundDetail:response.refundDetail})
            return res.status(500).json({success:false,message:response.message})


        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async getWithdrawalList(req:Request,res:Response,next:NextFunction){
          const page = parseInt(req.query.page as string) || 1;
          const limit = parseInt(req.query.limit as string) || 10;
          const startDate = req.query.startDate;
          const endDate = req.query.endDate;
        try{
            const response=await this.Interactor.getWithdrawalList(page,limit,startDate as string,endDate as string)
            if(response.status)return res.status(200).json({success:true,message:response.message,withdrawalList:response.withdrawalList,count:response.count})
                return res.status(404).json({success:false,message:response.message})

        }
        catch(error){
            console.log(error)
            next(error)
        }

    }

}
export default PayoutControllers