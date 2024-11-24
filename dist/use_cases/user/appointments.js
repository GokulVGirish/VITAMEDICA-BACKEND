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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpayInstance_1 = __importDefault(require("../../frameworks/services/razorpayInstance"));
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const agenda_1 = __importStar(require("../../frameworks/background/agenda"));
class UserAppointmentsInteractor {
    constructor(Repository, AwsS3) {
        this.Repository = Repository;
        this.AwsS3 = AwsS3;
    }
    async razorPayOrderGenerate(amount, currency, receipt) {
        try {
            const totalAmount = Math.round(parseFloat(amount) * 100);
            const order = await razorpayInstance_1.default.orders.create({
                amount: totalAmount.toString(),
                currency,
                receipt,
            });
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
                return {
                    status: false,
                    message: "Slot is not locked by you or lock has expired.",
                };
            const totalFees = parseFloat(fees);
            const appointmentFees = (totalFees * 0.8).toFixed(2);
            const result = await this.Repository.createAppointment(userId, docId, isoDate, start, end, fees, appointmentFees.toString(), "razorpay", razorpay_payment_id);
            if (!result)
                return { status: false, message: "Something Went Wrong" };
            await this.Repository.doctorWalletUpdate(docId, result._id, Number(appointmentFees), "credit", "Appointment Booked");
            const appointmentStart = new Date(slotDetails.slotTime.start).getTime();
            const notificationTime = new Date(appointmentStart - 2 * 60 * 60 * 1000);
            // const notificationTime = new Date(Date.now()+60*1000); 
            await agenda_1.default.schedule(notificationTime, "send appointment notification", {
                appointmentId: result._id,
                userId,
                docId,
            });
            return { status: true, message: "Success", appointment: result };
        }
        catch (error) {
            throw error;
        }
    }
    async bookFromWallet(userId, doctorId, slotDetails, fees) {
        try {
            const slotId = slotDetails.slotTime._id;
            const isoDate = new Date(slotDetails.date).toISOString();
            const start = new Date(slotDetails.slotTime.start).toISOString();
            const end = new Date(slotDetails.slotTime.end).toISOString();
            const slotBooking = await this.Repository.bookSlot(doctorId, userId, slotId, isoDate);
            if (!slotBooking)
                return {
                    status: false,
                    message: "Slot is not locked by you or lock has expired.",
                };
            const totalFees = parseFloat(fees);
            const appointmentFees = (totalFees * 0.8).toFixed(2);
            const result = await this.Repository.createAppointment(userId, doctorId, isoDate, start, end, fees, appointmentFees.toString(), "wallet");
            if (!result)
                return { status: false, message: "Something Went Wrong" };
            await this.Repository.userWalletUpdate(userId, result._id, totalFees, "debit", "booked Appointment");
            await this.Repository.doctorWalletUpdate(doctorId, result._id, Number(appointmentFees), "credit", "Appointment Booked");
            const appointmentStart = new Date(slotDetails.slotTime.start).getTime();
            const notificationTime = new Date(appointmentStart - 2 * 60 * 60 * 1000);
            await agenda_1.default.schedule(notificationTime, "send appointment notification", {
                appointmentId: result._id,
                userId,
                docId: doctorId,
            });
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
                return {
                    status: false,
                    message: "Slot is already locked or not available.",
                };
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
            return {
                status: true,
                appointments: response.appointments,
                totalPages: response.totalPages,
                message: "success",
            };
        }
        catch (error) {
            throw error;
        }
    }
    async cancelAppointment(userId, appointmentId, date, startTime, reason) {
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
            const refundAmount = parseFloat(appointment.fees) * 0.8;
            const appointmentCancel = await this.Repository.cancelAppointment(appointmentId, reason);
            if (!appointmentCancel.status)
                return { status: false, message: "Something Went Wrong" };
            const cancelSlot = await this.Repository.unbookSlot(appointmentCancel.docId, date, startTime);
            if (!cancelSlot)
                return { status: false, message: "Slot Cancellation Failed" };
            const doctorWalletDeduction = await this.Repository.doctorWalletUpdate(appointmentCancel.docId, new mongoose_1.default.Types.ObjectId(appointmentId), refundAmount, "debit", "User Cancelled Appointment");
            const cancellationAppointment = await this.Repository.createCancelledAppointment(appointmentCancel.docId, new mongoose_1.default.Types.ObjectId(appointmentId), refundAmount.toString(), "user", reason);
            if (!doctorWalletDeduction)
                return { status: false, message: "failure doing refunds" };
            const userWalletUpdate = await this.Repository.userWalletUpdate(userId, new mongoose_1.default.Types.ObjectId(appointmentId), refundAmount, "credit", "cancelled appointment refund");
            if (!userWalletUpdate)
                return { status: false, message: "something went wrong" };
            await (0, agenda_1.cancelJob)(new mongoose_1.default.Types.ObjectId(appointmentId));
            return { status: true, message: "Sucessfully Cancelled" };
        }
        catch (error) {
            throw error;
        }
    }
    async getAppointmentDetail(id) {
        try {
            const response = await this.Repository.getAppointment(id);
            if (!response)
                return { status: false, message: "something went wrong" };
            if (response && "docImage" in response && response.docImage) {
                const command = this.AwsS3.getObjectCommandS3(response.docImage);
                const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                response.docImage = url;
            }
            if (response?.status === "completed" &&
                "prescription" in response &&
                response.prescription) {
                const command = this.AwsS3.getObjectCommandS3(response.prescription);
                const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                response.prescription = url;
            }
            const messages = await this.Repository.getMessages(id);
            for (let message of messages) {
                if (message.type === "img") {
                    const command = this.AwsS3.getObjectCommandS3(message.message);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    message.message = url;
                }
            }
            const signedRecords = [];
            if (response.medicalRecords.length > 0) {
                for (let medicalRecord of response.medicalRecords) {
                    const command = this.AwsS3.getObjectCommandS3(medicalRecord);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    signedRecords.push(url);
                }
            }
            response.medicalRecords = signedRecords;
            if (response)
                return {
                    status: true,
                    message: "success",
                    appointmentDetail: response,
                    messages,
                };
            return { status: false, message: "something went wrong" };
        }
        catch (error) {
            throw error;
        }
    }
    async addReview(appointmentId, userId, docId, rating, description) {
        try {
            const response = await this.Repository.addReview(appointmentId, userId, docId, rating, description);
            const appointmentUpdated = await this.Repository.addUserReviewToAppointment(appointmentId, rating, description);
            if (response && appointmentUpdated)
                return { status: true, message: "review added sucessfully" };
            return { status: false, message: "Internal server Error" };
        }
        catch (error) {
            throw error;
        }
    }
    async medicalRecordUpload(appointmentId, files) {
        try {
            const keys = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const extension = file.mimetype.split("/")[1];
                const folderPath = `medicalRecords/${appointmentId}/record-${i + 1}.${extension}`;
                keys.push(folderPath);
                await this.AwsS3.putObjectCommandS3(folderPath, file.buffer, file.mimetype);
            }
            const savedToDb = await this.Repository.medicalRecordUpload(appointmentId, keys);
            return !!savedToDb;
        }
        catch (error) {
            console.error("Error uploading medical records:", error);
            throw error;
        }
    }
}
exports.default = UserAppointmentsInteractor;
