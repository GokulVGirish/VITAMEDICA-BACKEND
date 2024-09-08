import IImageUploadRepository from "../../entities/irepositories/iImageUploadRepository";
import chatSchemaModel from "../../frameworks/mongoose/models/ChatSchema";



class ImageUploadRepository implements IImageUploadRepository{
    async imageAsMessageUpdate(appointmentId: string,sender:string, filePath: string): Promise<boolean> {
        try{
               const result = await chatSchemaModel.updateOne(
                 { appointmentId: appointmentId },
                 { $push: { messages: { sender, message:filePath, type:"img" } } },
                 { upsert: true }
               );
               return result.modifiedCount>0
        }
        catch(error){
            throw error
        }
    }
}
export default ImageUploadRepository