"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailer_1 = require("../../entities/services/mailer");
const emailContent_1 = __importStar(require("./emailContent"));
const nodemailer = require("nodemailer");
const sendMail = async (email, content, type) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: mailer_1.Mailer.user,
            pass: mailer_1.Mailer.pass,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    let subject, text;
    if (type == "otp") {
        subject = "Signup Verification Mail from VitaMedica";
        text = (0, emailContent_1.otpEmailTemplate)(content);
    }
    else if (type === "notification") {
        subject = `Health Appointment`;
        text = content;
    }
    else {
        subject = "Password Reset Request";
        text = (0, emailContent_1.default)(content);
    }
    const mailOptions = {
        from: mailer_1.Mailer.user,
        to: email,
        subject: subject,
        html: text,
    };
    try {
        const response = await transporter.sendMail(mailOptions);
        console.log("Email sent:", response.response);
        return { success: true };
    }
    catch (error) {
        console.log("error sending email");
        return { success: false };
    }
};
exports.default = sendMail;
