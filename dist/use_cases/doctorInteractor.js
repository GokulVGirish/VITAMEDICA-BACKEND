"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const awsS3_1 = __importDefault(require("../entities/services/awsS3"));
const s3 = new client_s3_1.S3Client({
    region: awsS3_1.default.BUCKET_REGION,
    credentials: {
        accessKeyId: awsS3_1.default.ACCESS_KEY,
        secretAccessKey: awsS3_1.default.SECRET_KEY,
    },
});
class DoctorInteractor {
    constructor(Repository, Mailer, JWTServices) {
        this.Repository = Repository;
        this.Mailer = Mailer;
        this.JWTServices = JWTServices;
    }
    async otpSignup(doctor) {
        try {
            const exists = await this.Repository.doctorExists(doctor.email);
            if (!exists) {
                const mailResponse = await this.Mailer.sendMail(doctor.email);
                if (mailResponse.success) {
                    doctor.otp = mailResponse.otp;
                    doctor.password = await bcryptjs_1.default.hash(doctor.password, 10);
                    const response = await this.Repository.tempOtpDoctor(doctor);
                    const tempToken = this.JWTServices.generateToken({ emailId: doctor.email, role: "doctor", verified: false }, { expiresIn: "10m" });
                    return {
                        status: true,
                        message: "otp sucessfully sent",
                        token: tempToken,
                    };
                }
                else {
                    return {
                        status: false,
                        message: "error sending email",
                        errorCode: "EMAIL_SEND_FAILURE",
                    };
                }
            }
            else {
                return {
                    status: false,
                    message: "doctor already exist",
                    errorCode: "DOCTOR_EXISTS",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async verifyOtpSignup(otp) {
        try {
            const response = await this.Repository.createDoctorOtp(otp);
            if (response.status && response.doctor) {
                const accessToken = this.JWTServices.generateToken({ emailId: response.doctor.email, role: "doctor", verified: true }, { expiresIn: "1h" });
                const refreshToken = this.JWTServices.generateRefreshToken({ emailId: response.doctor.email, role: "doctor", verified: true }, { expiresIn: "1d" });
                return {
                    status: true,
                    message: "signed Up Sucessfully",
                    accessToken,
                    refreshToken,
                    doctor: response.doctor?.name, docstatus: response.doctor?.status
                };
            }
            else {
                return { status: false, message: response.message };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async login(email, password) {
        try {
            const doctor = await this.Repository.getDoctor(email);
            if (!doctor) {
                return {
                    status: false,
                    message: "invalid doctor",
                    errorCode: "INVALID_DOCTOR",
                };
            }
            if (doctor.isBlocked)
                return { status: false, message: "Sorry User Blocked" };
            const hashedPassword = doctor.password;
            const match = await bcryptjs_1.default.compare(password, hashedPassword);
            if (!match) {
                return {
                    status: false,
                    message: "invalid password",
                    errorCode: "INVALID_Password",
                };
            }
            const accessToken = this.JWTServices.generateToken({ emailId: doctor.email, role: "doctor", verified: true }, { expiresIn: "1h" });
            const refreshToken = this.JWTServices.generateRefreshToken({ emailId: doctor.email, role: "doctor", verified: true }, { expiresIn: "1d" });
            return {
                status: true,
                message: "logged in sucessfully",
                accessToken,
                refreshToken,
                doctor: doctor.name,
                doctorStatus: doctor.status,
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
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
            const bucketName = awsS3_1.default.BUCKET_NAME;
            const folderName = `doctorDocs/${docId}-doc`;
            const certificateImageKey = `${folderName}/certificateImage-${docId}.${file1.mimetype.split("/")[1]}`;
            const qualificationImageKey = `${folderName}/qualificationImage-${docId}.${file2.mimetype.split("/")[1]}`;
            const aadharFrontKey = `${folderName}/aadharFront-${docId}.${file3.mimetype.split("/")[1]}`;
            const aadharBackKey = `${folderName}/aadharBack-${docId}.${file4.mimetype.split("/")[1]}`;
            await this.uploadFileToS3(bucketName, certificateImageKey, file1);
            await this.uploadFileToS3(bucketName, qualificationImageKey, file2);
            await this.uploadFileToS3(bucketName, aadharFrontKey, file3);
            await this.uploadFileToS3(bucketName, aadharBackKey, file4);
            await this.Repository.documentsUpdate(docId, certificateImageKey, qualificationImageKey, aadharFrontKey, aadharBackKey);
            await this.Repository.docStatusChange(docId, "Submitted");
            return { status: true };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async uploadFileToS3(bucketName, key, file) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        await s3.send(command);
    }
    async resendOtp(email) {
        try {
            const mailResponse = await this.Mailer.sendMail(email);
            if (!mailResponse.success) {
                return { status: false, message: "error sending email" };
            }
            const otp = mailResponse.otp;
            const response = await this.Repository.resendOtp(otp, email);
            if (response) {
                return { status: true, message: "otp sucessfully sent" };
            }
            else {
                return { status: false, message: "retry signup" };
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorInteractor;
