"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const customError_1 = __importDefault(require("../../frameworks/express/functions/customError"));
class UserAuthInteractor {
    constructor(Repository, Mailer, JWTServices) {
        this.Repository = Repository;
        this.Mailer = Mailer;
        this.JWTServices = JWTServices;
    }
    async otpSignup(user) {
        try {
            const exist = await this.Repository.userExist(user.email);
            if (exist)
                throw new customError_1.default("User Already Exist", 409);
            const mailResponse = await this.Mailer.sendMail(user.email);
            if (!mailResponse.success)
                throw new customError_1.default("Error Sending Mail", 500);
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
        catch (error) {
            if (error && error instanceof Error) {
                throw new customError_1.default(error.message || "Internal Server Error", 500);
            }
            else {
                throw new customError_1.default("Internal Server Error", 500);
            }
        }
    }
    async verifyOtpSignup(otp) {
        try {
            const response = await this.Repository.createUserOtp(otp);
            if (!response.status)
                throw new customError_1.default("Invalid Otp", 400);
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
            return {
                status: true,
                accessToken,
                refreshToken,
                userId: response.user._id,
                name: response.user.name,
            };
        }
        catch (error) {
            if (error && error instanceof Error) {
                throw new customError_1.default(error.message || "Internal Server Error", 500);
            }
            else {
                throw new customError_1.default("Internal Server Error", 500);
            }
        }
    }
    async login(email, password) {
        try {
            const userExist = await this.Repository.getUser(email);
            if (userExist?.register === "Google") {
                throw new customError_1.default("Use Google Login", 400);
            }
            if (!userExist) {
                throw new customError_1.default("Person not found", 404);
            }
            const hashedPassword = userExist.password;
            const match = await bcryptjs_1.default.compare(password, hashedPassword);
            if (!match) {
                throw new customError_1.default("Wrong password", 401);
            }
            if (userExist.isBlocked) {
                throw new customError_1.default("Sorry, User Blocked", 403);
            }
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
                message: "Logged in successfully",
                userId: userExist._id,
                name: userExist.name,
            };
        }
        catch (error) {
            if (error && error instanceof Error) {
                throw new customError_1.default(error.message || "Internal Server Error", 500);
            }
            else {
                throw new customError_1.default("Internal Server Error", 500);
            }
        }
    }
    async googleLogin(name, email, password) {
        try {
            const userExist = await this.Repository.getUser(email);
            if (!userExist) {
                password = await bcryptjs_1.default.hash(password, 10);
                const response = await this.Repository.googleSignup(email, name, password);
                const accessToken = this.JWTServices.generateToken({
                    emailId: email,
                    role: "user",
                    userId: response._id,
                    verified: true,
                }, { expiresIn: "1h" });
                const refreshToken = this.JWTServices.generateRefreshToken({
                    emailId: email,
                    role: "user",
                    userId: response._id,
                    verified: true,
                }, { expiresIn: "1d" });
                return {
                    status: true,
                    accessToken,
                    refreshToken,
                    message: "Signed Up Sucessfully",
                    name: response.name,
                    userId: response._id,
                };
            }
            const hashedPassword = userExist?.password;
            const match = await bcryptjs_1.default.compare(password, hashedPassword);
            if (!match)
                throw new customError_1.default("Invalid Credentials", 400);
            if (userExist?.isBlocked)
                throw new customError_1.default("Sorry, User Blocked", 403);
            const accessToken = this.JWTServices.generateToken({
                emailId: userExist?.email,
                userId: userExist?._id,
                role: "user",
                verified: true,
            }, { expiresIn: "1h" });
            const refreshToken = this.JWTServices.generateRefreshToken({
                emailId: userExist?.email,
                userId: userExist?._id,
                role: "user",
                verified: true,
            }, { expiresIn: "1d" });
            return {
                status: true,
                accessToken,
                refreshToken,
                message: "logged in Sucessfully",
                name: userExist?.name,
                userId: userExist?._id,
            };
        }
        catch (error) {
            if (error && error instanceof Error) {
                throw new customError_1.default(error.message || "Internal Server Error", 500);
            }
            else {
                throw new customError_1.default("Internal Server Error", 500);
            }
        }
    }
    async resendOtp(email) {
        try {
            const mailResponse = await this.Mailer.sendMail(email);
            if (!mailResponse.success)
                throw new customError_1.default("Error Sending Mail", 500);
            const otp = mailResponse.otp;
            const response = await this.Repository.resendOtp(otp, email);
            if (!response)
                throw new customError_1.default("Retry Signup", 400);
            return { status: true, message: "otp sucessfully sent" };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = UserAuthInteractor;
