import { error } from "console"
import { IAdminInteractor } from "../../entities/iuse_cases/iAdminInteractor"
import { Request,Response,NextFunction, response } from "express"

class AdminController{

    constructor(private readonly interactor:IAdminInteractor){ }
    async login(req:Request,res:Response,next:NextFunction){
        try{
            const {email,password}=req.body
            const response=await this.interactor.adminLogin(email,password)
            if(response.status){
                res.status(200).json({success:true,adminAccessToken:response.adminAccessToken,adminRefreshToken:response.adminRefreshToken,message:"logged in sucessfully"})
            }else{
                res.status(400).json({success:false,message:response.message})
            }

        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    verifyToken(req:Request,res:Response,next:NextFunction){
        try{
            res.status(200).json({success:true,message:"token verified"})

        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async getDepartments(req:Request,res:Response,next:NextFunction){
        try{
            const response=await this.interactor.getDepartments()
            if(response.status){
                res.status(200).json({success:true,departments:response.departments})
            }else{
                 res
                   .status(500)
                   .json({ success: false });

            }
            

        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async addDepartment(req:Request,res:Response,next:NextFunction){
        try{
            const departmentName=req.body.department
            console.log("body",req.body)
            const response=await this.interactor.addDepartment(departmentName)
            if(response.status){
                res.status(200).json({success:true,department:response.department,message:"Department added"})
            }else{
                 res
                   .status(500)
                   .json({
                     success: false,
                     message: response.message,
                   });

            }


        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async deleteDepartment(req:Request,res:Response,next:NextFunction){
      
        try{
              const id = req.params.id;
            const response=await this.interactor.deleteDepartment(id)
            if(response.status){
                res.status(200).json({success:true,message:response.message})
            }else{
                res
                  .status(500)
                  .json({ success: false, message: response.message });
            }


        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async getUsers(req:Request,res:Response,next:NextFunction){
        try{
            const response=await this.interactor.getUsers()
            if(response.status){
                res.status(200).json({success:true,message:response.message,users:response.users})
            }else{
                res
                  .status(500)
                  .json({
                    success: true,
                    message: response.message,
                  });

            }


        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
    async blockUnblockUser(req:Request,res:Response,next:NextFunction){
        try{
            const userId=req.params.id
            const status=req.params.status
            const response=await this.interactor.blockUnblockUser(userId,status)
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
    async getUnverifiedDoctors(req:Request,res:Response,next:NextFunction){
        try{
            const response=await this.interactor.getUnverifiedDoctors()
            if(response.status){
                res.status(200).json({success:true,doctors:response.doctors})
            }else{
                    res
                      .status(500)
                      .json({ success: false });

            }


        }
        catch(error){
            console.log(error)
            next(error)
        }
    }
    async getDoctorDocs(req:Request,res:Response,next:NextFunction){
        try{
            const id=req.params.id
            console.log("helloooo")
            const response=await this.interactor.getDoctorDocs(id)
            if(response.status){
                res.status(200).json({success:true,doctor:response.doctor})
            }else{
                res.status(500).json({success:false})
            }


        }
        catch(error){
            console.log(error)
            next(error)
        }
        
    }
    async verifyDoctor(req:Request,res:Response,next:NextFunction){
        try{

            const id=req.params.id
            const response=await this.interactor.verifyDoctor(id)
            if(response){
                res.status(200).json({success:true})
            }else{
                     res.status(500).json({ success: false });

            }

        }
        catch(error){
            console.log(error)
            throw error
        }
    }
    async getDoctors(req:Request,res:Response,next:NextFunction){
        try{
            const response=await this.interactor.getDoctors()
            if(response.status){
                res.status(200).json({success:true,doctors:response.doctors})
            }else{
                res.status(500).json({success:false})

            }

        }
        catch(error){
            console.log(error)
            
        }
    }
    async doctorBlockUnblock(req:Request,res:Response,next:NextFunction){
        try{
            const docId = req.params.id;
            const status = req.params.status;
            console.log("clicked")
            const response=await this.interactor.blockUnblockDoctor(docId,status)
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
    async rejectDoctor(req:Request,res:Response,next:NextFunction){
        try{
            const {id}=req.params
            const {reason}=req.query
            const response=await this.interactor.rejectDoctor(id,reason as string)
            if(response.success){
                res.status(200).json({success:true,message:response.message});
            }else{
                res.status(500).json({success:false,message:response.message})
            }


        }
        catch(error){
            console.log(error)
            next(error)
        }

    }
}
export default AdminController