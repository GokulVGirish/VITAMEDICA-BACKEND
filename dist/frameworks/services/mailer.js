"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateOtp_1 = require("./generateOtp");
const sendEmail_1 = __importDefault(require("./sendEmail"));
class Mailer {
    async sendMail(email) {
        const otp = (0, generateOtp_1.generateRandomOTP)(4);
        const response = await (0, sendEmail_1.default)(email, otp, "otp");
        console.log("otp is", otp);
        return { otp: otp, success: response.success };
    }
    async sendPasswordResetLink(email) {
        const link = `http://localhost:5173/reset-password/`;
        const response = await (0, sendEmail_1.default)(email, link, "link");
        return { success: response.success };
    }
}
exports.default = Mailer;
