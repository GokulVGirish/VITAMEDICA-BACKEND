import { Request, Response, NextFunction } from "express";
import { IDoctorInteractor } from "../../entities/iuse_cases/iDoctorInteractor";
import { doctorDataRequest } from "../../frameworks/express/middlewares/doctor";
import { CustomRequestType } from "../../frameworks/express/middlewares/role-Authenticate";

class DoctorController {
  constructor(private readonly interactor: IDoctorInteractor) {}
  async otpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const response = await this.interactor.otpSignup(data);
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token,
        });
      } else {
        switch (response.errorCode) {
          case "DOCTOR_EXISTS":
            res.status(409).json({ success: false, message: response.message });
            break;
          case "EMAIL_SEND_FAILURE":
            res.status(500).json({ success: false, message: response.message });
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
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ success: true, message: "token verified" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async verifyOtpSignup(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;
      const response = await this.interactor.verifyOtpSignup(otp);
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            doctor:response.doctor,
            status:response.docstatus
          });
      } else {
        res.status(400).json({ success: false, message: response.message });
      }
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
        res
          .status(200)
          .json({
            success: true,
            message: response.message,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            doctor: response.doctor,
            status: response.doctorStatus,
          });
      } else {
        switch (response.errorCode) {
          case "INVALID_DOCTOR":
            res.status(400).json({ success: false, message: response.message });
            break;
          case "INVALID_Password":
            res.status(400).json({ success: false, message: response.message });
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
  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.interactor.getDepartments();
      if (response.status) {
        res
          .status(200)
          .json({ success: true, departments: response.departments });
      } else {
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getProfile(req:Request,res:Response,next:NextFunction){
    try{

        (req as doctorDataRequest).doctorData.password="**********"

         
        res
          .status(200)
          .json({ success: true, doctorData: (req as doctorDataRequest).doctorData });


    }
    catch(error){
        console.log(error)
        next(error)
    }

  }
  async uploadDocuments(req:Request,res:Response,next:NextFunction){
    try{
        console.log("files",req.files)
        let files: Express.Multer.File[] = [];

        if (Array.isArray(req.files)) {
          files = req.files as Express.Multer.File[];
        } else if (req.files && typeof req.files === "object") {
          files = Object.values(req.files).flat() as Express.Multer.File[];
        }

        if (files.length !== 4) {
          return res
            .status(400)
            .json({ status: false, message: "Exactly 4 images are required" });
        }
        const [file1, file2, file3, file4] = files;
        const docId=(req as doctorDataRequest).doctorData._id.toString()
        const response=await this.interactor.documentsUpload(docId ,file1,file2,file3,file4)
        if(response.status){
            res.status(200).json({message:"success",status:"Submitted"})
        }else{
              res.status(500).json({ message: "failed" });

        }

    }
    catch(error){
        console.log(error)
        next(error)
    }

  }
  async resendOtp(req:Request,res:Response,next:NextFunction){
    try{
       const emailId = (req as CustomRequestType).user.emailId;
    const response = await this.interactor.resendOtp(emailId as string);
    if (response.status) {
      res.status(200).json({ success: true, message: response.message });
    } else {
      res.status(400).json({ success: false, message: response.message });
    }



    }
    catch(error){
      console.log(error)
      next(error)
    }

  }
}
export default DoctorController;
