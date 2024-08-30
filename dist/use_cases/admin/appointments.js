"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminAppointmentsInteractor {
    constructor(repository, AwsS3) {
        this.repository = repository;
        this.AwsS3 = AwsS3;
    }
    async fetchAppointments(page, limit, startDate, endDate) {
        try {
            const result = await this.repository.fetchAppointments(page, limit, startDate, endDate);
            return { success: true, message: "Sucess", data: result };
        }
        catch (error) {
            throw error;
        }
    }
    async fetchAppointmentDetail(id) {
        try {
            const result = await this.repository.fetchAppointmentDetail(id);
            if (result) {
                if ("docImage" in result && result.docImage) {
                    const command = this.AwsS3.getObjectCommandS3(result.docImage);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    result.docImage = url;
                }
                if ("userImage" in result && result.userImage) {
                    const command = this.AwsS3.getObjectCommandS3(result.userImage);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    result.userImage = url;
                }
                if (result.status === "completed") {
                    const command = this.AwsS3.getObjectCommandS3(result.prescription);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    result.prescription = url;
                }
            }
            return { success: true, message: "Success", data: result };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminAppointmentsInteractor;
