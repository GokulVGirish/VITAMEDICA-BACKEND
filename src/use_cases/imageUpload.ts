import IImageUploadRepository from "../entities/irepositories/iImageUploadRepository";
import IImageUploadInteractor from "../entities/iuse_cases/iImageUpload";
import { MulterFile } from "../entities/rules/multerFile";
import { IawsS3 } from "../entities/services/awsS3";
import { s3 } from "../frameworks/services/awsS3";


class ImageUploadInteractor implements IImageUploadInteractor{
    constructor(private readonly Repository:IImageUploadRepository,private readonly AwsS3:IawsS3){}
    async uploadImage(appointmentId: string,sender:string,image:MulterFile): Promise<{ success: boolean; message: string; url?: string; }> {
        try{
            const folderPath=`imageMessage/${appointmentId}/${Date.now()}`
         await this.AwsS3.putObjectCommandS3(folderPath,image.buffer,image.mimetype)
         const command=this.AwsS3.getObjectCommandS3(folderPath)
         const url=await this.AwsS3.getSignedUrlS3(command,3600)
         const updateDbMessage=await this.Repository.imageAsMessageUpdate(appointmentId,sender,folderPath)
         if(url && updateDbMessage) return {success:true,message:"sent",url}
         return {success:false,message:"failed"}
         
        
        }
        catch(error){
            throw error
        }
        
    }

}
export default ImageUploadInteractor