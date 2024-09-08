import { Request,Response,NextFunction } from "express";
import IImageUploadInteractor from "../../entities/iuse_cases/iImageUpload";
import { MulterFile } from "../../entities/rules/multerFile";


class ImageUploadController{
    constructor(private readonly interactor:IImageUploadInteractor){}

    async imageUpload(req:Request,res:Response,next:NextFunction){
        try{
            const id=req.params.appointmentId
            const sender=req.params.sender
            console.log("req fike",req.file)
            const response = await this.interactor.uploadImage(
              id as string,
              sender,
              req.file as MulterFile
            );
            if(response.success) return res.status(200).json({success:true,message:response.message,url:response.url})
                res.status(500).json({success:false,message:response.message})

        }
        catch(error){
            console.log(error)
        }

    }


}
export default ImageUploadController