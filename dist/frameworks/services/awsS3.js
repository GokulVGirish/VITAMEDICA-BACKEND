"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const awsS3_1 = __importDefault(require("../../entities/services/awsS3"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
exports.s3 = new client_s3_1.S3Client({
    region: awsS3_1.default.BUCKET_REGION,
    credentials: {
        accessKeyId: awsS3_1.default.ACCESS_KEY,
        secretAccessKey: awsS3_1.default.SECRET_KEY,
    },
});
class AwsS3 {
    getObjectCommandS3(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: awsS3_1.default.BUCKET_NAME,
            Key: key
        });
        return command;
    }
    async getSignedUrlS3(command, expiresIn) {
        const url = await (0, s3_request_presigner_1.getSignedUrl)(exports.s3, command, { expiresIn: expiresIn });
        return url;
    }
    async putObjectCommandS3(key, image, contentType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: awsS3_1.default.BUCKET_NAME,
            Key: key,
            Body: image,
            ContentType: contentType
        });
        await exports.s3.send(command);
    }
    async deleteObjectCommandS3(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: awsS3_1.default.BUCKET_NAME,
            Key: key
        });
        await exports.s3.send(command);
    }
}
exports.default = AwsS3;
