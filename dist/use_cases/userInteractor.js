"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
const client_s3_1 = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const awsS3_1 = __importDefault(require("../entities/services/awsS3"));
const mongoose_1 = __importDefault(require("mongoose"));
const razorpayInstance_1 = __importDefault(require("../frameworks/services/razorpayInstance"));
const s3 = new client_s3_1.S3Client({
    region: awsS3_1.default.BUCKET_REGION,
    credentials: {
        accessKeyId: awsS3_1.default.ACCESS_KEY,
        secretAccessKey: awsS3_1.default.SECRET_KEY
    }
});
class UserInteractor {
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
                    const tempToken = this.JWTServices.generateToken({ emailId: user.email, role: "user", verified: false }, { expiresIn: "10m" });
                    return {
                        status: response.status,
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
                const accessToken = this.JWTServices.generateToken({ emailId: response.user.email, role: "user", verified: true }, { expiresIn: "1h" });
                const refreshToken = this.JWTServices.generateRefreshToken({ emailId: response.user.email, role: "user", verified: true }, { expiresIn: "1d" });
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
                    const accessToken = this.JWTServices.generateToken({ emailId: userExist.email, role: "user", verified: true }, { expiresIn: "1h" });
                    const refreshToken = this.JWTServices.generateRefreshToken({ emailId: userExist.email, role: "user", verified: true }, { expiresIn: "1d" });
                    return {
                        status: true,
                        accessToken,
                        refreshToken,
                        message: "logged in sucessfullly",
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
    async getProfile(image) {
        try {
            if (image) {
                const command2 = new client_s3_1.GetObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: image,
                });
                const url = await getSignedUrl(s3, command2, {
                    expiresIn: 3600,
                });
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
            if (respose.success) {
                return {
                    status: true,
                    message: "updated sucessfully",
                    data: user || undefined
                };
            }
            else {
                return {
                    status: false,
                    message: "Error updating",
                };
            }
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
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: key,
                    Body: image.buffer,
                    ContentType: image.mimetype,
                });
                await s3.send(command);
                const response = await this.Repository.updateProfileImage(id, key);
                const command2 = new client_s3_1.GetObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: key,
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
            const resetLink = `http://localhost:5173/reset-password?token=${hashedToken}`;
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
    async getDoctorsList(skip, limit) {
        try {
            const result = await this.Repository.getDoctors(skip, limit);
            if (result) {
                for (const doctor of result.doctors) {
                    if (doctor.image) {
                        const command2 = new client_s3_1.GetObjectCommand({
                            Bucket: awsS3_1.default.BUCKET_NAME,
                            Key: doctor.image,
                        });
                        const url = await getSignedUrl(s3, command2, {
                            expiresIn: 3600,
                        });
                        doctor.image = url;
                    }
                }
                return {
                    status: true,
                    message: "Successfully fetched",
                    doctors: result.doctors,
                    totalPages: result.totalPages
                };
            }
            return { status: false, message: "Something Went Wrong" };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorPage(id) {
        try {
            const response = await this.Repository.getDoctor(id);
            if (!response)
                return { status: false, message: "something went wrong" };
            if (response.image) {
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: awsS3_1.default.BUCKET_NAME,
                    Key: response.image,
                });
                const url = await getSignedUrl(s3, command, {
                    expiresIn: 3600,
                });
                response.image = url;
            }
            return { status: true, message: "Sucessful", doctor: response };
        }
        catch (error) {
            throw error;
        }
    }
    async getAvailableDate(id) {
        try {
            const result = await this.Repository.getSlots(id);
            if (!result)
                return { status: false, message: "no available slots" };
            const dates = [
                ...new Set(result.map((slot) => slot.date.toISOString().split("T")[0])),
            ];
            return { status: true, message: "Success", dates: dates };
        }
        catch (error) {
            throw error;
        }
    }
    async getTimeSlots(id, date) {
        try {
            const result = await this.Repository.getTimeSlots(id, date);
            console.log("result", result);
            if (!result)
                return { status: false, message: "Something went wrong" };
            return { status: true, message: "Success", slots: result };
        }
        catch (error) {
            throw error;
        }
    }
    async razorPayOrderGenerate(amount, currency, receipt) {
        try {
            const order = await razorpayInstance_1.default.orders.create({ amount, currency, receipt });
            if (!order)
                return { status: false, message: "Something Went Wrong" };
            return { status: true, message: "Success", order: order };
        }
        catch (error) {
            throw error;
        }
    }
    async razorPayValidateBook(razorpay_order_id, razorpay_payment_id, razorpay_signature, docId, slotDetails, userId, fees) {
        try {
            console.log("docId", docId, "slotDetails", slotDetails);
            const razorPaySecret = process.env.RazorPaySecret;
            const sha = crypto_1.default.createHmac("sha256", razorPaySecret);
            sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            const digest = sha.digest("hex");
            if (digest !== razorpay_signature) {
                return { status: false, message: "Payment failure" };
            }
            const slotId = slotDetails.slotTime._id;
            const isoDate = new Date(slotDetails.date).toISOString();
            const start = new Date(slotDetails.slotTime.start).toISOString();
            const end = new Date(slotDetails.slotTime.end).toISOString();
            const slotBooking = await this.Repository.bookSlot(docId, userId, slotId, isoDate);
            if (!slotBooking)
                return { status: false, message: "Slot is not locked by you or lock has expired." };
            const totalFees = parseFloat(fees);
            const appointmentFees = (totalFees * 0.8).toFixed(2);
            const result = await this.Repository.createAppointment(userId, docId, isoDate, start, end, fees, razorpay_payment_id, appointmentFees.toString());
            if (!result)
                return { status: false, message: "Something Went Wrong" };
            await this.Repository.doctorWalletUpdate(docId, result._id, Number(appointmentFees), "credit", "Appointment Booked", "razorpay");
            return { status: true, message: "Success", appointment: result };
        }
        catch (error) {
            throw error;
        }
    }
    async lockSlot(userId, docId, date, slotId) {
        try {
            const lockExpiration = new Date(Date.now() + 5 * 60 * 1000);
            const isoDate = new Date(date).toISOString();
            const response = await this.Repository.lockSlot(userId, docId, isoDate, slotId, lockExpiration);
            if (!response)
                return { status: false, message: "Slot is already locked or not available." };
            return { status: true, message: "Slot locked successfully." };
        }
        catch (error) {
            throw error;
        }
    }
    async getAppointments(page, limit, userId) {
        try {
            const response = await this.Repository.getAppointments(page, limit, userId);
            if (!response.status)
                return { status: false, message: "No appointments" };
            return { status: true, appointments: response.appointments, totalPages: response.totalPages, message: "success" };
        }
        catch (error) {
            throw error;
        }
    }
    async getWalletInfo(page, limit, userId) {
        try {
            const response = await this.Repository.userWalletInfo(page, limit, userId);
            if (!response.status)
                return { status: false, message: "No wallet Found" };
            return { status: true, message: "Sucessful", userWallet: response.userWallet, totalPages: response.totalPages };
        }
        catch (error) {
            throw error;
        }
    }
    async cancelAppointment(userId, appointmentId, date, startTime) {
        try {
            const appointment = await this.Repository.getAppointment(appointmentId);
            if (!appointment)
                return { status: false, message: "Something went wrong" };
            const now = (0, moment_1.default)();
            const appointmentCreationTime = (0, moment_1.default)(appointment.createdAt);
            if (now.diff(appointmentCreationTime, "hours") > 4) {
                return {
                    status: false,
                    message: "You can only cancel the appointment within 4 hours of making it.",
                };
            }
            const refundAmount = Number(appointment.fees) * 0.8;
            const appointmentCancel = await this.Repository.cancelAppointment(appointmentId);
            if (!appointmentCancel.status)
                return { status: false, message: "Something Went Wrong" };
            const cancelSlot = await this.Repository.unbookSlot(appointmentCancel.docId, date, startTime);
            if (!cancelSlot)
                return { status: false, message: "Slot Cancellation Failed" };
            const doctorWalletDeduction = await this.Repository.doctorWalletUpdate(appointmentCancel.docId, new mongoose_1.default.Types.ObjectId(appointmentId), refundAmount, "debit", "User Cancelled Appointment", "razorpay");
            const cancellationAppointment = await this.Repository.createCancelledAppointment(appointmentCancel.docId, new mongoose_1.default.Types.ObjectId(appointmentId), refundAmount.toString(), "user");
            if (!doctorWalletDeduction)
                return { status: false, message: "failure doing refunds" };
            const userWalletUpdate = await this.Repository.userWalletUpdate(userId, new mongoose_1.default.Types.ObjectId(appointmentId), refundAmount, "credit", "cancelled appointment refund", "razorpay");
            if (!userWalletUpdate)
                return { status: false, message: "something went wrong" };
            return { status: true, message: "Sucessfully Cancelled" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = UserInteractor;
