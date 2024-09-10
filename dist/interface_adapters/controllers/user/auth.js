"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAuthControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async otpSignup(req, res, next) {
        try {
            const body = req.body;
            const response = await this.interactor.otpSignup(body);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    token: response.token,
                });
            }
            else {
                res.status(200).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log("otpsignup", error);
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
                    message: "signed Up Sucessfully",
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    userId: response.userId,
                    name: response.name
                });
            }
            else {
                res
                    .status(400)
                    .json({ success: false, message: "invalid otp Entered" });
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
                    message: "logged in Sucessfully",
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    userId: response.userId,
                    name: response.name,
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
    async verifyToken(req, res, next) {
        try {
            res.status(200).json({ success: true, message: "token verified" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async googleLogin(req, res, next) {
        try {
            const { email, sub, name } = req.body;
            console.log(req.body);
            const response = await this.interactor.googleLogin(name, email, sub);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    name: response.name,
                    userId: response.userId
                });
            }
            else {
                switch (response.errorCode) {
                    case "NO_USER":
                        return res
                            .status(404)
                            .json({ success: false, message: response.message });
                    case "INCORRECT_PASSWORD":
                        return res
                            .status(401)
                            .json({ success: false, message: response.message });
                    case "BLOCKED":
                        return res
                            .status(403)
                            .json({ success: false, message: response.message });
                    case "Server_Error":
                        return res
                            .status(500)
                            .json({ success: false, message: response.message });
                    default:
                        return res
                            .status(400)
                            .json({ success: false, message: response.message });
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
            console.log("email", emailId);
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
exports.default = UserAuthControllers;
