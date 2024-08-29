import { Request, Response, NextFunction } from "express";
import IAdminUserManagement from "../../../entities/iuse_cases/admin/iUserManagement";

class AdminUserManagementControllers {
  constructor(private readonly interactor: IAdminUserManagement) {}
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.interactor.getUsers();
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            users: response.users,
          });
      } else {
        res.status(500).json({
          success: true,
          message: response.message,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async blockUnblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const status = req.params.status;
      const response = await this.interactor.blockUnblockUser(userId, status);
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
  async getUserProfile(req:Request,res:Response,next:NextFunction){
    try{
      const id=req.params.id
      const response=await this.interactor.getUserProfile(id)
      if(response.status)return res.status(200).json({success:true,message:response.message,user:response.data})
      return res.status(500).json({success:false,message:response.message})

    }
    catch(error){
      console.log(error)
      next(error)
      
    }
  }
  async getUserAppointments(req:Request,res:Response,next:NextFunction){
    try{
      const id=req.params.id
      const page=parseInt(req.query.page as string)||1
      const limit=parseInt(req.query.limit as string)||10
      console.log("id",id,"page",page,"limit",limit)
      const response=await this.interactor.getUserAppointments(id,page,limit)
      if(response.message) return res.status(200).json({success:true,message:response.message,data:response.data})
        return res.status(404).json({success:false,message:response.message})


    }
    catch(error){
      next(error)
      console.log(error)
    }
  }
}
export default AdminUserManagementControllers
