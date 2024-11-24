"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = __importDefault(require("../../../frameworks/express/functions/customError"));
class UserAuthControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async otpSignup(req, res, next) {
        try {
            const body = req.body;
            const response = await this.interactor.otpSignup(body);
            res.status(200).json({
                success: true,
                message: response.message,
                token: response.token,
            });
        }
        catch (error) {
            if (error instanceof customError_1.default) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
    async verifyOtpSignup(req, res, next) {
        try {
            const { otp } = req.body;
            const response = await this.interactor.verifyOtpSignup(otp);
            res.cookie("accessToken", response.accessToken, {
                httpOnly: true,
                maxAge: 3600 * 1000,
                domain: process.env.cors_origin,
                path: "/",
                sameSite: "strict",
            });
            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                maxAge: 604800 * 1000,
                domain: process.env.cors_origin,
                path: "/",
                sameSite: "strict",
            });
            res.status(200).json({
                success: true,
                message: "Signed Up Sucessfully",
                userId: response.userId,
                name: response.name,
            });
        }
        catch (error) {
            if (error instanceof customError_1.default) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.interactor.login(email, password);
            res.cookie("accessToken", response.accessToken, {
                httpOnly: true,
                maxAge: 3600 * 1000,
                path: "/",
                sameSite: "strict",
            });
            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                maxAge: 604800 * 1000,
                path: "/",
                sameSite: "strict",
            });
            res.status(200).json({
                success: true,
                message: response.message || "Logged in successfully",
                userId: response.userId,
                name: response.name,
            });
        }
        catch (error) {
            if (error instanceof customError_1.default) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            }
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
            const response = await this.interactor.googleLogin(name, email, sub);
            res.cookie("accessToken", response.accessToken, {
                httpOnly: true,
                maxAge: 3600 * 1000,
                path: "/",
                sameSite: "strict",
            });
            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                maxAge: 604800 * 1000,
                path: "/",
                sameSite: "strict",
            });
            res.status(200).json({
                success: true,
                message: response.message,
                name: response.name,
                userId: response.userId,
            });
        }
        catch (error) {
            if (error instanceof customError_1.default) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
    async resendOtp(req, res, next) {
        try {
            const emailId = req.user.emailId;
            const response = await this.interactor.resendOtp(emailId);
            res.status(200).json({ success: true, message: response.message });
        }
        catch (error) {
            if (error instanceof customError_1.default) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ success: "LoggedOut Sucessfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserAuthControllers;
