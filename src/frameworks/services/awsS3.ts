import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import s3Config from "../../entities/services/awsS3";
import { IawsS3 } from "../../entities/services/awsS3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: s3Config.BUCKET_REGION,
  credentials: {
    accessKeyId: s3Config.ACCESS_KEY,
    secretAccessKey: s3Config.SECRET_KEY,
  },
});


class AwsS3 implements IawsS3{

     getObjectCommandS3(key:string): GetObjectCommand {
        const command=new GetObjectCommand({
            Bucket:s3Config.BUCKET_NAME,
            Key:key
        })
        return command
        
    }
    async getSignedUrlS3(command: GetObjectCommand, expiresIn: number) {
        const url=await getSignedUrl(s3,command,{expiresIn:expiresIn})
        return url
    }
    async putObjectCommandS3(key: string, image: Buffer, contentType: string) {
         const command=new PutObjectCommand({
            Bucket:s3Config.BUCKET_NAME,
            Key:key,
            Body:image,
            ContentType:contentType

         })
         await s3.send(command)
    }
    async deleteObjectCommandS3(key:string){

        const command=new DeleteObjectCommand({
            Bucket:s3Config.BUCKET_NAME,
            Key:key

        })
        await s3.send(command)

    }


}
export default AwsS3