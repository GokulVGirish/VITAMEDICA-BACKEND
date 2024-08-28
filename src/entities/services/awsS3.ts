import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

interface s3ConfigType{
    BUCKET_NAME:string
BUCKET_REGION:string,
ACCESS_KEY:string
SECRET_KEY:string

}
export interface IawsS3{
  getObjectCommandS3(key:string):GetObjectCommand
  getSignedUrlS3(command:GetObjectCommand,expiresIn:number):any
  putObjectCommandS3(key:string,image:Buffer,contentType:string):void
   deleteObjectCommandS3(key:string):void
}

const s3Config: s3ConfigType = {
  BUCKET_NAME: process.env.BUCKET_NAME as string,
  BUCKET_REGION: process.env.BUCKET_REGION as string,
  ACCESS_KEY: process.env.ACCESS_KEY as string,
  SECRET_KEY: process.env.SECRET_KEY as string,
};
export default s3Config



