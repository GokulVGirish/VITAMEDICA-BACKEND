"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ImageUploadInteractor {
    constructor(Repository, AwsS3) {
        this.Repository = Repository;
        this.AwsS3 = AwsS3;
    }
    async uploadImage(appointmentId, sender, image) {
        try {
            const folderPath = `imageMessage/${appointmentId}/${Date.now()}`;
            await this.AwsS3.putObjectCommandS3(folderPath, image.buffer, image.mimetype);
            const command = this.AwsS3.getObjectCommandS3(folderPath);
            const url = await this.AwsS3.getSignedUrlS3(command, 3600);
            const updateDbMessage = await this.Repository.imageAsMessageUpdate(appointmentId, sender, folderPath);
            if (url && updateDbMessage)
                return { success: true, message: "sent", url };
            return { success: false, message: "failed" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = ImageUploadInteractor;
