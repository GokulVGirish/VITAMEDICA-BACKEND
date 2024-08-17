"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const awsS3_1 = __importDefault(require("../entities/services/awsS3"));
const app_1 = require("../frameworks/express/app");
const s3 = new client_s3_1.S3Client({
    region: awsS3_1.default.BUCKET_REGION,
    credentials: {
        accessKeyId: awsS3_1.default.ACCESS_KEY,
        secretAccessKey: awsS3_1.default.SECRET_KEY
    }
});
class AdminInteractor {
    constructor(repository, JwtServices) {
        this.repository = repository;
        this.JwtServices = JwtServices;
    }
    async adminLogin(email, password) {
        try {
            const adminExist = await this.repository.getAdmin(email);
            if (adminExist) {
                const hashedPassword = adminExist.password;
                const match = await bcryptjs_1.default.compare(password, hashedPassword);
                if (match) {
                    const adminAccessToken = this.JwtServices.generateToken({ emailId: adminExist.email, verified: true, role: "admin" }, { expiresIn: "1h" });
                    const adminRefreshToken = this.JwtServices.generateRefreshToken({ emailId: adminExist.email, verified: true, role: "admin" }, { expiresIn: "1d" });
                    return {
                        status: true,
                        adminAccessToken,
                        adminRefreshToken,
                        message: "logged in sucessfully",
                    };
                }
                else {
                    return { status: false, message: "incorrect password" };
                }
            }
            else {
                return {
                    status: false,
                    message: "Admin not found",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDepartments() {
        try {
            const response = await this.repository.getDepartments();
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
    async addDepartment(name) {
        try {
            const data = await this.repository.getDepartments();
            const exists = data.departments?.find((dep) => dep.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                return { status: false, message: "Department already exist" };
            }
            const response = await this.repository.addDepartment(name);
            if (response.status) {
                return {
                    status: true,
                    department: response.department,
                };
            }
            else {
                return {
                    status: false,
                    message: "internal server error",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteDepartment(id) {
        try {
            const response = await this.repository.deleteDepartment(id);
            if (response.status) {
                return { status: true, message: response.message };
            }
            else {
                return { status: true, message: response.message };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getUsers() {
        try {
            const response = await this.repository.getUsers();
            if (response.status) {
                return {
                    status: true,
                    message: response.message,
                    users: response.users,
                };
            }
            else {
                return {
                    status: false,
                    message: response.message,
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async blockUnblockUser(id, status) {
        try {
            let changedStatus;
            if (status === "true") {
                changedStatus = false;
            }
            else {
                changedStatus = true;
            }
            const response = await this.repository.blockUnblockUser(id, changedStatus);
            if (!response) {
                return { status: false, message: "internal server error" };
            }
            if (changedStatus) {
                app_1.io.to(id).emit("blocked", "user");
            }
            return {
                status: true,
                message: `user has been sucessfully ${changedStatus ? "Blocked" : "Unblocked"}`,
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getUnverifiedDoctors() {
        try {
            const response = await this.repository.getUnverifiedDoctors();
            if (response.status) {
                return { status: true, doctors: response.doctors };
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
    async getDoctorDocs(id) {
        try {
            const result = await this.repository.getDoctor(id);
            if (!result.status) {
                return { status: false };
            }
            const doctor = result.doctor;
            if (!doctor || !doctor.documents) {
                return { status: false };
            }
            const certificateImage = await this.getSignedUrlForImage(doctor.documents.certificateImage);
            const qualificationImage = await this.getSignedUrlForImage(doctor.documents.qualificationImage);
            const aadarFrontImage = await this.getSignedUrlForImage(doctor.documents.aadarFrontImage);
            const aadarBackImage = await this.getSignedUrlForImage(doctor.documents.aadarBackImage);
            doctor.documents.certificateImage = certificateImage;
            doctor.documents.qualificationImage = qualificationImage;
            doctor.documents.aadarFrontImage = aadarFrontImage;
            doctor.documents.aadarBackImage = aadarBackImage;
            return { status: true, doctor: doctor };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getSignedUrlForImage(imageKey) {
        try {
            if (imageKey) {
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: imageKey,
                });
                const url = await getSignedUrl(s3, command, {
                    expiresIn: 3600,
                });
                return url;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async verifyDoctor(id) {
        try {
            const result = await this.repository.verifyDoctor(id);
            app_1.io.to(id).emit("doctorVerified");
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctors() {
        try {
            const response = await this.repository.getDoctors();
            if (response.status) {
                return { status: true, doctors: response.doctors };
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
    async blockUnblockDoctor(id, status) {
        try {
            let changedStatus;
            if (status === "true") {
                changedStatus = false;
            }
            else {
                changedStatus = true;
            }
            const response = await this.repository.blockUnblockDoctor(id, changedStatus);
            if (!response) {
                return { status: false, message: "internal server error" };
            }
            if (changedStatus) {
                app_1.io.to(id).emit("blocked", "doctor");
            }
            return {
                status: true,
                message: `user has been sucessfully ${changedStatus ? "Blocked" : "Unblocked"}`,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async deleteImageFromS3(imageKey) {
        try {
            if (imageKey) {
                const command = new client_s3_1.DeleteObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: imageKey,
                });
                await s3.send(command);
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.error('Error deleting image from S3:', error);
            throw error;
        }
    }
    async rejectDoctor(id, reason) {
        try {
            const result = await this.repository.getDoctor(id);
            if (!result.status)
                return { success: false, message: "Doctor Not Found" };
            const doctor = result.doctor;
            await this.deleteImageFromS3(doctor?.documents?.certificateImage);
            await this.deleteImageFromS3(doctor?.documents?.qualificationImage);
            await this.deleteImageFromS3(doctor?.documents?.aadarFrontImage);
            await this.deleteImageFromS3(doctor?.documents?.aadarBackImage);
            await this.repository.deleteDoctor(id);
            const response = await this.repository.createRejectedDoctor(doctor?.email, reason);
            if (!response)
                return { success: false, message: "Internal server error" };
            return { success: true, message: "Rejected Sucessfully" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminInteractor;
