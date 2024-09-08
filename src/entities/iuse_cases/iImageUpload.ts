import { promises } from "dns";
import { MulterFile } from "../rules/multerFile";


interface IImageUploadInteractor {
  uploadImage(
    appointmentId: string,
    sender:string,
    image: MulterFile
  ): Promise<{ success: boolean; message: string; url?: string }>;
}
export default IImageUploadInteractor