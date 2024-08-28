"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorUtilityInteractor {
    constructor(Repository, AwsS3) {
        this.Repository = Repository;
        this.AwsS3 = AwsS3;
    }
    async getDepartments() {
        try {
            const response = await this.Repository.getDepartments();
            if (response.status) {
                return { status: true, departments: response.departments };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async documentsUpload(docId, file1, file2, file3, file4) {
        try {
            const folderName = `doctorDocs/${docId}-doc`;
            const certificateImageKey = `${folderName}/certificateImage-${docId}.${file1.mimetype.split("/")[1]}`;
            const qualificationImageKey = `${folderName}/qualificationImage-${docId}.${file2.mimetype.split("/")[1]}`;
            const aadharFrontKey = `${folderName}/aadharFront-${docId}.${file3.mimetype.split("/")[1]}`;
            const aadharBackKey = `${folderName}/aadharBack-${docId}.${file4.mimetype.split("/")[1]}`;
            await this.AwsS3.putObjectCommandS3(certificateImageKey, file1.buffer, file1.mimetype);
            await this.AwsS3.putObjectCommandS3(qualificationImageKey, file2.buffer, file2.mimetype);
            await this.AwsS3.putObjectCommandS3(aadharFrontKey, file3.buffer, file3.mimetype);
            await this.AwsS3.putObjectCommandS3(aadharBackKey, file4.buffer, file4.mimetype);
            await this.Repository.documentsUpdate(docId, certificateImageKey, qualificationImageKey, aadharFrontKey, aadharBackKey);
            await this.Repository.docStatusChange(docId, "Submitted");
            return { status: true };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getYearlyRevenue(id) {
        try {
            const result = await this.Repository.getYearlyRevenue(id);
            const monthlyRevenue = await this.Repository.getMonthlyRevenue(id);
            const weeklyAppointmentCount = await this.Repository.getWeeklyAppointmentCount(id);
            const monthlyAppointmentCount = await this.Repository.getMonthlyAppointmentCount(id);
            return {
                status: true,
                message: "success",
                dataYearly: result,
                dataMonthly: monthlyRevenue,
                weeklyCount: weeklyAppointmentCount,
                monthlyCount: monthlyAppointmentCount,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorUtilityInteractor;
