import { IUserInteractor } from "../../entities/iuse_cases/iuserInteractor";
import { Request, Response, NextFunction } from "express";
import userDataRequest from "../../frameworks/express/middlewares/user";
import { MulterFile } from "../../entities/rules/multerFile";
import { User } from "../../entities/rules/user";
import { CustomRequestType } from "../../frameworks/express/middlewares/role-Authenticate";
import { ObjectId, Types } from "mongoose";

class UserController {
  constructor(private readonly interactor: IUserInteractor) {}
  async otpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const response = await this.interactor.otpSignup(body);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token,
        });
      } else {
        res.status(200).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log("otpsignup", error);
      next(error);
    }
  }
  async verifyOtpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;
      const response = await this.interactor.verifyOtpSignup(otp);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: "signed Up Sucessfully",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "invalid otp Entered" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, message: "token verified" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await this.interactor.login(email, password);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: "logged in Sucessfully",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async googleSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, sub } = req.body;

      const response = await this.interactor.googleSignup(email, name, sub);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        switch (response.errorCode) {
          case "USER_EXIST":
            res.status(409).json({ status: false, message: response.message });
            break;
          case "SERVER_ERROR":
            res.status(500).json({ status: false, message: response.message });
            break;
          default:
            res.status(400).json({ success: false, message: response.message });
            break;
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, sub } = req.body;
      console.log(req.body);
      const response = await this.interactor.googleLogin(email, sub);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: "logged in Sucessfully",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } else {
        switch (response.errorCode) {
          case "NO_USER":
            return res
              .status(404)
              .json({ success: false, message: response.message });
          case "INCORRECT_PASSWORD":
            return res
              .status(401)
              .json({ success: false, message: response.message });
          case "BLOCKED":
            return res
              .status(403)
              .json({ success: false, message: response.message });
          default:
            return res
              .status(400)
              .json({ success: false, message: response.message });
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const emailId = (req as CustomRequestType).user.emailId;
      console.log("email", emailId);
      const response = await this.interactor.resendOtp(emailId as string);
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.interactor.getProfile(
        (req as userDataRequest).userData.image as string
      );

      (req as userDataRequest).userData.password = "*******";
      (req as userDataRequest).userData.image = response.url;

      res
        .status(200)
        .json({ success: true, userData: (req as userDataRequest).userData });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async profileUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as userDataRequest).userData._id;
      const email = (req as userDataRequest).userData.email
    
      const user: any = {
        name: req.body.name,
        phone: req.body.phone,
        dob: req.body.dob,
        gender: req.body.gender,
        address: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          postalCode: req.body.zip,
        },
        bloodGroup: req.body.bloodGroup,
      };
        console.log("userdata", user);

      const response = await this.interactor.profileUpdate(
        user,
        userId as Types.ObjectId
        ,email
      );
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            data: response.data,
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
  async ProfilePictureUpdate(req:Request,res:Response,next:NextFunction) {
    try{
         const userId = (req as userDataRequest).userData._id;
         const response = await this.interactor.updateProfileImage(
           userId as Types.ObjectId,
           req.file as MulterFile
         );
         if (response.status) {
           res
             .status(200)
             .json({ success: true, imageData: response.imageData });
         } else {
           res.status(500).json({ success: false });
         }

    }
    catch(error){
      console.log(error)
      next(error)
    }



  }
  async passwordResetLink(req:Request,res:Response,next:NextFunction){
    try{
      const email=req.body.email
      const response=await this.interactor.passwordResetLink(email)
      if(response.status){
        res.status(200).json({success:true,message:response.message})
      }else{
        res.status(500).json({success:false,message:response.message})
      }

    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
  async resetPassword(req:Request,res:Response,next:NextFunction){

    try{
      const token=req.params.token
      const password=req.body.password
      const response=await this.interactor.resetPassword(token,password)
      if(response.status){
        res.status(200).json({success:true,message:response.message})
      }
      else{
        res.status(500).json({success:false,message:response.message})
      }



    }
    catch(error){
      console.log(error)
      throw error
    }
  }
  async getDoctorList(req:Request,res:Response,next:NextFunction){
    try{
       const page = parseInt(req.query.page as string) || 1;
       const limit = parseInt(req.query.limit as string) || 6;
       const skip = (page - 1) * limit;

         const response=await this.interactor.getDoctorsList(skip,limit)
         if(response.status)return res.status(200).json({ success: true,message:response.message,doctors:response.doctors,totalPages:response.totalPages });
         else res.status(500).json({success:false,message:response.message})
    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
  async getDoctorPage(req:Request,res:Response,next:NextFunction){
    try{
      const {id}=req.params
      const response=await this.interactor.getDoctorPage(id)
      if(response.status){
        res.status(200).json({success:true,message:response.message,doctor:response.doctor})
      }else{
        res.status(500).json({success:false,message:response.message})
      }

    }
    catch(error){
      console.log(error)
    }

  }
  async getAvailableDate(req:Request,res:Response,next:NextFunction){
    try{
      const {id}=req.params
      const response=await this.interactor.getAvailableDate(id)
      if(response.status){
        res.status(200).json({success:true,message:response.message,dates:response.dates})
      }else{
         res
           .status(404)
           .json({
             success: false,
             message: response.message,
           });

      }



    }
    catch(error){
      console.log(error)
    }
  }
  async getTimeSlots(req:Request,res:Response,next:NextFunction){
    try{
      const date=req.query.date
      const id=req.params.id
      const response=await this.interactor.getTimeSlots(id,date as string)
      if(response.status){
        res.status(200).json({success:true,message:response.message,slots:response.slots})
      }else{
        res.status(500).json({success:false,message:response.message})
      }


    }
    catch(error){
      console.log(error)
      next(error)
    }
  }
  async razorPayOrder(req:Request,res:Response,next:NextFunction){
    try{
      console.log("inside")
      const body=req.body
      const response=await this.interactor.razorPayOrderGenerate(body.amount,body.currency,body.receipt)
      if(response.status){
        res.status(200).json({success:true,message:response.message,order:response.order})
      }else{
        res.status(500).json({success:false,message:response.message})
      }


    }
    catch(error){
      next(error)
    }

  }
  async razorPayValidate(req:Request,res:Response,next:NextFunction){
    try{
      const { razorpay_order_id,razorpay_payment_id, razorpay_signature,docId,slotDetails,fees } = req.body;
      const userId=(req as userDataRequest).userData._id
      const response=await this.interactor.razorPayValidateBook(razorpay_order_id,razorpay_payment_id,razorpay_signature,docId,slotDetails,userId as Types.ObjectId,fees)
      console.log("response",response)
      if(response.status){
        res.status(200).json({success:true,message:response.message,appointment:response.appointment})
      }else{
        res.status(400).json({success:false,message:response.message})
      }

    }
    catch(error){
      next(error)
      throw error
    }
  }
  async lockSlot(req:Request,res:Response,next:NextFunction){
    try{
      const {doctorId,date,slotId}=req.body
      console.log("docId",doctorId,"date",date,"slotId",slotId)
      const usertId=(req as userDataRequest).userData._id
      const response=await this.interactor.lockSlot(usertId as Types.ObjectId,doctorId,date,slotId)
      if(response.status){
        res.status(200).json({success:true,message:response.message})
      }else{
        res.status(400).json({success:false,message:response.message})
      }


    }
    catch(error){
      next(error)
      throw error
    }
  }
}
export default UserController;
