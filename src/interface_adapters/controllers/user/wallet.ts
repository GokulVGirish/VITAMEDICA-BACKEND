import { IUserInteractor } from "../../../entities/iuse_cases/iuserInteractor";
import { Request, Response, NextFunction } from "express";
import userDataRequest from "../../../frameworks/express/middlewares/user";
import { Types } from "mongoose";


 class UserWalletControllers {
   constructor(private readonly interactor: IUserInteractor) {}
   async getWalletInfo(req: Request, res: Response, next: NextFunction) {
     try {
       const page = parseInt(req.query.page as string) || 1;
       const limit = parseInt(req.query.limit as string) || 10;
       const userId = (req as userDataRequest).userData._id;
       const response = await this.interactor.getWalletInfo(
         page,
         limit,
         userId as Types.ObjectId
       );
       if (response.status) {
         res
           .status(200)
           .json({
             success: true,
             message: response.message,
             walletDetail: response.userWallet,
             totalPages: response.totalPages,
           });
       } else {
         res.status(404).json({ success: false, message: response.message });
       }
     } catch (error) {
        next(error)
     }
   }
 }
 export default UserWalletControllers