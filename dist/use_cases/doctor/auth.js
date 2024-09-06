"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class DoctorAuthInteractor {
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
                    const tempToken = this.JWTServices.generateToken({
                        emailId: doctor.email,
                        role: "doctor",
                        userId: response.userId,
                        verified: false,
                    }, { expiresIn: "10m" });
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
                const accessToken = this.JWTServices.generateToken({
                    emailId: response.doctor.email,
                    role: "doctor",
                    userId: response.doctor._id,
                    verified: true,
                }, { expiresIn: "1h" });
                const refreshToken = this.JWTServices.generateRefreshToken({
                    emailId: response.doctor.email,
                    role: "doctor",
                    userId: response.doctor._id,
                    verified: true,
                }, { expiresIn: "1d" });
                return {
                    status: true,
                    message: "signed Up Sucessfully",
                    accessToken,
                    refreshToken,
                    doctor: response.doctor?.name,
                    docstatus: response.doctor?.status,
                    docId: response.doctor._id
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
                return {
                    status: false,
                    message: rejectDoctor.reason,
                    errorCode: "VERIFICATION_FAILED",
                };
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
            const accessToken = this.JWTServices.generateToken({
                emailId: doctor.email,
                role: "doctor",
                userId: doctor._id,
                verified: true,
            }, { expiresIn: "1h" });
            const refreshToken = this.JWTServices.generateRefreshToken({
                emailId: doctor.email,
                role: "doctor",
                userId: doctor._id,
                verified: true,
            }, { expiresIn: "1d" });
            return {
                status: true,
                message: "logged in sucessfully",
                accessToken,
                refreshToken,
                doctor: doctor.name,
                doctorStatus: doctor.status,
                doctorId: doctor._id,
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
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
exports.default = DoctorAuthInteractor;
