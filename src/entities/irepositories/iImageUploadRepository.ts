


interface IImageUploadRepository{
    imageAsMessageUpdate(appointmentId:string,sender:string,filePath:string):Promise<boolean>
}
export default IImageUploadRepository