"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class ProfileInteractor {
    constructor(Repository, Mailer, AwsS3) {
        this.Repository = Repository;
        this.Mailer = Mailer;
        this.AwsS3 = AwsS3;
    }
    async getProfile(image) {
        try {
            if (image) {
                const command = this.AwsS3.getObjectCommandS3(image);
                const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                return { url: url };
            }
            else {
                return { url: null };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async profileUpdate(data, userId, email) {
        try {
            console.log("data here", data);
            const respose = await this.Repository.updateProfile(userId, data);
            const user = await this.Repository.getUser(email);
            if (user) {
                user.password = "****************";
            }
            console.log("user", user);
            console.log("response 2", respose);
            if (respose.success)
                return {
                    status: true,
                    message: "updated sucessfully",
                    data: user || undefined,
                };
            else
                return {
                    status: false,
                    message: "Error updating",
                };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateProfileImage(id, image) {
        try {
            try {
                const folderPath = "users";
                const fileExtension = image.originalname.split(".").pop();
                const uniqueFileName = `profile-${id}.${fileExtension}`;
                const key = `${folderPath}/${uniqueFileName}`;
                await this.AwsS3.putObjectCommandS3(key, image.buffer, image.mimetype);
                const response = await this.Repository.updateProfileImage(id, key);
                const command = this.AwsS3.getObjectCommandS3(key);
                const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                return { status: true, imageData: url };
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async passwordResetLink(email) {
        try {
            const user = await this.Repository.getUser(email);
            if (!user)
                return { status: false, message: "User Not Found" };
            const resetTokenExpiry = Date.now() + 600000;
            const payload = { email, resetTokenExpiry };
            const hashedToken = jsonwebtoken_1.default.sign(payload, process.env.Password_RESET_SECRET);
            const resetLink = `${process.env.cors_origin}/reset-password?token=${hashedToken}&request=user`;
            const result = await this.Mailer.sendPasswordResetLink(email, resetLink);
            if (!result.success)
                return { status: false, message: "Internal Server Error" };
            return { status: true, message: "Link Sucessfully Sent" };
        }
        catch (error) {
            throw error;
        }
    }
    async resetPassword(token, password) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.Password_RESET_SECRET);
            const { email, resetTokenExpiry } = decodedToken;
            const userExist = await this.Repository.getUser(email);
            if (!userExist)
                return { status: false, message: "Invalid User" };
            if (Date.now() > new Date(resetTokenExpiry).getTime())
                return { status: false, message: "Expired Link" };
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const response = await this.Repository.resetPassword(email, hashedPassword);
            if (!response)
                return { status: false, message: "Internal server error" };
            return { status: true, message: "Password Changed Sucessfully" };
        }
        catch (error) {
            throw error;
        }
    }
    async fetchNotificationCount(userId) {
        try {
            const count = await this.Repository.fetchNotificationCount(userId);
            return count;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchNotifications(userId) {
        try {
            const result = await this.Repository.fetchNotifications(userId);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async markNotificationAsRead(userId) {
        try {
            const response = await this.Repository.markNotificationAsRead(userId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = ProfileInteractor;
