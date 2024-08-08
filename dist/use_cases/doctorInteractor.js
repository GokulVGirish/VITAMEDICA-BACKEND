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
            const rejectDoctor = await this.Repository.getRejectedDoctor(email);
            if (rejectDoctor)
                return { status: false, message: rejectDoctor.reason, errorCode: "VERIFICATION_FAILED" };
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
    async getProfile(image) {
        try {
            if (image) {
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: image
                });
                const url = await getSignedUrl(s3, command, {
                    expiresIn: 3600,
                });
                return { url: url };
            }
            else {
                return { url: null };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async updateProfileImage(id, image) {
        try {
            const folderPath = "doctors";
            const fileExtension = image.originalname.split(".").pop();
            const uniqueFileName = `profile-${id}.${fileExtension}`;
            const key = `${folderPath}/${uniqueFileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: awsS3_1.default.BUCKET_NAME,
                Key: key,
                Body: image.buffer,
                ContentType: image.mimetype
            });
            await s3.send(command);
            const response = await this.Repository.updateProfileImage(id, key);
            const command2 = new client_s3_1.GetObjectCommand({
                Bucket: awsS3_1.default.BUCKET_NAME,
                Key: key
            });
            const url = await getSignedUrl(s3, command2, {
                expiresIn: 3600,
            });
            return { status: true, imageData: url };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async profileUpdate(data, userId, email) {
        try {
            const response = await this.Repository.profileUpdate(userId, { name: data.name, phone: data.phone, description: data.description, fees: data.fees, degree: data.degree });
            if (!response)
                return { status: false, message: "internal server error" };
            const result = await this.Repository.getDoctor(email);
            if (result) {
                return { status: true, data: result, message: "Profile sucessfully Updated" };
            }
            else {
                return { status: false, message: "internal server error" };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async addSlots(id, data) {
        try {
            const exist = await this.Repository.getSlot(data.date, id);
            if (exist)
                return { status: false, message: "Slot For this Day Already exist" };
            const response = await this.Repository.createSlot(id, data);
            if (!response)
                return { status: false, message: "Something Went Wrong" };
            return { status: true, message: "Slot Added Sucessfully" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorInteractor;
