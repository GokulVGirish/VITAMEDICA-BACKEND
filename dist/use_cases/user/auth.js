"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserAuthInteractor {
    constructor(Repository, Mailer, JWTServices) {
        this.Repository = Repository;
        this.Mailer = Mailer;
        this.JWTServices = JWTServices;
    }
    async otpSignup(user) {
        try {
            const exist = await this.Repository.userExist(user.email);
            if (!exist) {
                const mailResponse = await this.Mailer.sendMail(user.email);
                if (mailResponse.success) {
                    user.otp = mailResponse.otp;
                    user.password = await bcryptjs_1.default.hash(user.password, 10);
                    const response = await this.Repository.tempOtpUser(user);
                    const tempToken = this.JWTServices.generateToken({
                        emailId: user.email,
                        userId: response.userId,
                        role: "user",
                        verified: false,
                    }, { expiresIn: "10m" });
                    return {
                        status: true,
                        message: "otp sucessfully sent",
                        token: tempToken,
                    };
                }
                else {
                    return { status: false, message: "error sending email" };
                }
            }
            else {
                return { status: false, message: "user already exist" };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async verifyOtpSignup(otp) {
        try {
            const response = await this.Repository.createUserOtp(otp);
            if (response.status) {
                const accessToken = this.JWTServices.generateToken({
                    emailId: response.user.email,
                    userId: response.user._id,
                    role: "user",
                    verified: true,
                }, { expiresIn: "1h" });
                const refreshToken = this.JWTServices.generateRefreshToken({
                    emailId: response.user.email,
                    role: "user",
                    userId: response.user._id,
                    verified: true,
                }, { expiresIn: "1d" });
                return { status: true, accessToken, refreshToken };
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
    async login(email, password) {
        try {
            const userExist = await this.Repository.getUser(email);
            if (userExist?.register === "Google") {
                return {
                    status: false,
                    message: "Use Google Login",
                };
            }
            if (userExist) {
                const hashedPassword = userExist.password;
                const match = await await bcryptjs_1.default.compare(password, hashedPassword);
                if (match) {
                    if (userExist.isBlocked)
                        return { status: false, message: "Sorry User Blocked" };
                    const accessToken = this.JWTServices.generateToken({
                        emailId: userExist.email,
                        userId: userExist._id,
                        role: "user",
                        verified: true,
                    }, { expiresIn: "1h" });
                    const refreshToken = this.JWTServices.generateRefreshToken({
                        emailId: userExist.email,
                        userId: userExist._id,
                        role: "user",
                        verified: true,
                    }, { expiresIn: "1d" });
                    return {
                        status: true,
                        accessToken,
                        refreshToken,
                        message: "logged in sucessfullly",
                        userId: userExist._id,
                        name: userExist.name,
                    };
                }
                else {
                    return { status: false, message: "wrong password" };
                }
            }
            else {
                return { status: false, message: "person not found" };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async googleSignup(email, name, password) {
        try {
            const exists = await this.Repository.userExist(email);
            if (exists) {
                return {
                    status: false,
                    message: "User already exists",
                    errorCode: "USER_EXIST",
                };
            }
            password = await bcryptjs_1.default.hash(password, 10);
            const response = await this.Repository.googleSignup(email, name, password);
            if (response.status) {
                const accessToken = this.JWTServices.generateToken({
                    emailId: email,
                    role: "user",
                    verified: true,
                }, { expiresIn: "1h" });
                const refreshToken = this.JWTServices.generateRefreshToken({
                    emailId: email,
                    role: "user",
                    verified: true,
                }, { expiresIn: "1d" });
                return {
                    status: true,
                    accessToken,
                    refreshToken,
                    message: response.message,
                };
            }
            else {
                return {
                    status: true,
                    message: response.message,
                    errorCode: "SERVER_ERROR",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async googleLogin(email, password) {
        try {
            console.log("mail", email, password, "password");
            const userExist = await this.Repository.getUser(email);
            if (!userExist) {
                return {
                    status: false,
                    message: "This user dosent exist",
                    errorCode: "NO_USER",
                };
            }
            const hashedPassword = userExist.password;
            const match = await bcryptjs_1.default.compare(password, hashedPassword);
            if (!match) {
                return {
                    status: false,
                    message: "Incorrect password",
                    errorCode: "INCORRECT_PASSWORD",
                };
            }
            if (userExist.isBlocked)
                return {
                    status: false,
                    message: "Sorry User Blocked",
                    errorCode: "BLOCKED",
                };
            const accessToken = this.JWTServices.generateToken({ emailId: userExist.email, role: "user", verified: true }, { expiresIn: "1h" });
            const refreshToken = this.JWTServices.generateRefreshToken({ emailId: userExist.email, role: "user", verified: true }, { expiresIn: "1d" });
            return {
                status: true,
                accessToken,
                refreshToken,
                message: "logged in Sucessfully",
                name: userExist.name,
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
            console.log(error);
            throw error;
        }
    }
}
exports.default = UserAuthInteractor;
