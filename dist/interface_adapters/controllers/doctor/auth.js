"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorAuthControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async otpSignup(req, res, next) {
        try {
            const data = req.body;
            const response = await this.interactor.otpSignup(data);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    token: response.token,
                });
            }
            else {
                switch (response.errorCode) {
                    case "DOCTOR_EXISTS":
                        res.status(409).json({ success: false, message: response.message });
                        break;
                    case "EMAIL_SEND_FAILURE":
                        res.status(500).json({ success: false, message: response.message });
                        break;
                    default:
                        res.status(400).json({ success: false, message: response.message });
                        break;
                }
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async verifyToken(req, res, next) {
        try {
            res.status(200).json({ success: true, message: "token verified" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async verifyOtpSignup(req, res, next) {
        try {
            const { otp } = req.body;
            const response = await this.interactor.verifyOtpSignup(otp);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    doctor: response.doctor,
                    status: response.docstatus,
                    docId: response.docId
                });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.interactor.login(email, password);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    doctor: response.doctor,
                    status: response.doctorStatus,
                    docId: response.doctorId,
                });
            }
            else {
                switch (response.errorCode) {
                    case "INVALID_DOCTOR":
                        res.status(400).json({ success: false, message: response.message });
                        break;
                    case "INVALID_Password":
                        res.status(400).json({ success: false, message: response.message });
                        break;
                    case "VERIFICATION_FAILED":
                        res.status(403).json({
                            success: false,
                            message: `Verification failed ${response.message}`,
                        });
                        break;
                    default:
                        res.status(400).json({ success: false, message: response.message });
                        break;
                }
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async resendOtp(req, res, next) {
        try {
            const emailId = req.user.emailId;
            const response = await this.interactor.resendOtp(emailId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = DoctorAuthControllers;
