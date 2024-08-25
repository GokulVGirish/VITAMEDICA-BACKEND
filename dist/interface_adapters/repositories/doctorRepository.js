"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TempDoctor_1 = __importDefault(require("../../frameworks/mongoose/models/TempDoctor"));
const departmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/departmentSchema"));
const DoctorSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSchema"));
const mongoose_1 = require("mongoose");
const RejectedDoctor_1 = __importDefault(require("../../frameworks/mongoose/models/RejectedDoctor"));
const DoctorSlotsSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSlotsSchema"));
const DoctorWalletSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorWalletSchema"));
const moment_1 = __importDefault(require("moment"));
const AppointmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/AppointmentSchema"));
const cancelledAppointmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/cancelledAppointmentSchema"));
const UserWalletSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserWalletSchema"));
const UserSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserSchema"));
const dates_1 = require("../../frameworks/services/dates");
class DoctorRepository {
    async doctorExists(email) {
        try {
            const doctor = await DoctorSchema_1.default.findOne({ email: email });
            return doctor;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async tempOtpDoctor(data) {
        try {
            const otpDoc = await TempDoctor_1.default.create(data);
            return { userId: otpDoc._id };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async createDoctorOtp(otp) {
        try {
            const otpDoctor = await TempDoctor_1.default.findOne({ otp: otp });
            if (!otpDoctor) {
                return { status: false, message: "invalid otp" };
            }
            const now = new Date();
            const expirationTime = new Date(otpDoctor?.time.getTime() + 2 * 60 * 1000);
            if (expirationTime < now) {
                return { status: false, message: "expired otp" };
            }
            const doc = await DoctorSchema_1.default.create({
                name: otpDoctor.name,
                email: otpDoctor.email,
                password: otpDoctor.password,
                phone: otpDoctor.phone,
                gender: otpDoctor.gender,
                department: otpDoctor.department,
            });
            return { status: true, message: "created", doctor: doc };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDoctor(email) {
        try {
            const doctor = await DoctorSchema_1.default.findOne({ email: email });
            return doctor;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDepartments() {
        try {
            const departments = await departmentSchema_1.default.find();
            if (departments) {
                return { status: true, departments: departments };
            }
            else {
                return {
                    status: false,
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async documentsUpdate(docId, key1, key2, key3, key4) {
        try {
            await DoctorSchema_1.default.updateOne({ _id: docId }, {
                $set: {
                    documents: {
                        certificateImage: key1,
                        qualificationImage: key2,
                        aadarFrontImage: key3,
                        aadarBackImage: key4,
                    },
                },
            });
            await DoctorSchema_1.default.updateOne({ _id: docId }, {
                $set: {
                    documentsUploaded: true,
                },
            });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async docStatusChange(id, status) {
        try {
            await DoctorSchema_1.default.updateOne({ _id: id }, { $set: { status: status } });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async resendOtp(otp, email) {
        try {
            const otpDoc = await TempDoctor_1.default.findOne({ email: email });
            if (otpDoc) {
                otpDoc.otp = otp;
                otpDoc.time = new Date();
                await otpDoc.save();
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async resetPassword(email, password) {
        try {
            const result = await DoctorSchema_1.default.updateOne({ email: email }, { $set: { password: password } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async updateProfileImage(id, imagePath) {
        try {
            const result = await DoctorSchema_1.default.updateOne({ _id: id }, { $set: { image: imagePath } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async profileUpdate(id, data) {
        try {
            const result = await DoctorSchema_1.default.updateOne({ _id: id }, {
                $set: {
                    name: data.name,
                    phone: data.phone,
                    description: data.description,
                    fees: data.fees,
                    degree: data.degree,
                    complete: true,
                },
            });
            if (result.modifiedCount > 0)
                return true;
            else
                return false;
        }
        catch (error) {
            throw error;
        }
    }
    async getRejectedDoctor(email) {
        try {
            const result = await RejectedDoctor_1.default.findOne({ email: email });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getSlot(date, id) {
        try {
            const result = await DoctorSlotsSchema_1.default.findOne({
                date: date,
                doctorId: id,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async createSlot(id, data) {
        try {
            const slot = await DoctorSlotsSchema_1.default.create({
                doctorId: id,
                date: data.date,
                slots: data.slots.map((slot) => ({ start: slot.start, end: slot.end })),
            });
            if (slot)
                return true;
            else
                return false;
        }
        catch (error) {
            throw error;
        }
    }
    async getWalletDetails(page, limit, docId) {
        try {
            const walletDetails = await DoctorWalletSchema_1.default.aggregate([
                {
                    $match: { doctorId: docId },
                },
                {
                    $project: {
                        balance: 1,
                        transactionCount: 1,
                        transactions: {
                            $slice: [
                                {
                                    $reverseArray: "$transactions",
                                },
                                (page - 1) * limit,
                                limit,
                            ],
                        },
                    },
                },
            ]);
            console.log("walletDetails", walletDetails);
            if (!walletDetails || walletDetails.length === 0) {
                return { status: false };
            }
            const totalPages = Math.ceil(walletDetails[0].transactionCount / limit);
            return {
                status: true,
                doctorWallet: walletDetails[0],
                totalPages: totalPages,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getTodaysAppointments(docId) {
        try {
            const startOfDay = (0, moment_1.default)().startOf("day").toDate();
            const endOfDay = (0, moment_1.default)().endOf("day").toDate();
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        docId: docId,
                        date: { $gte: startOfDay, $lte: endOfDay },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userInfo",
                    },
                },
                {
                    $unwind: "$userInfo",
                },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        start: 1,
                        end: 1,
                        userName: "$userInfo.name",
                        userId: "$userInfo._id",
                        status: 1,
                        paymentStatus: 1,
                        amount: 1,
                    },
                },
            ]);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getUpcommingAppointments(docId, page, limit) {
        try {
            const currentdate = new Date();
            const result = await AppointmentSchema_1.default.aggregate([
                { $match: { docId: docId, date: { $gt: currentdate } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userInfo",
                    },
                },
                {
                    $unwind: "$userInfo",
                },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        start: 1,
                        end: 1,
                        userName: "$userInfo.name",
                        status: 1,
                        paymentStatus: 1,
                        amount: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);
            if (result) {
                const totalAppointments = await AppointmentSchema_1.default.countDocuments({
                    docId: docId,
                    date: { $gt: currentdate },
                });
                const totalPages = Math.ceil(totalAppointments / limit);
                return { status: true, appointments: result, totalPages };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getAvailableDate(id) {
        try {
            const result = await DoctorSlotsSchema_1.default.find({
                doctorId: id,
                active: true,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getTimeSlots(id, date) {
        try {
            const startOfDay = (0, moment_1.default)(date).startOf("day").toDate();
            const endOfDay = (0, moment_1.default)(date).endOf("day").toDate();
            const result = await DoctorSlotsSchema_1.default.findOne({
                doctorId: id,
                date: { $gte: startOfDay, $lte: endOfDay },
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteSlots(id, date, startTime) {
        try {
            const startOfDay = (0, moment_1.default)(date).startOf("day").toDate();
            const endOfDay = (0, moment_1.default)(date).endOf("day").toDate();
            console.log("sewf", startOfDay, endOfDay, startTime);
            const reault = await DoctorSlotsSchema_1.default.updateOne({ doctorId: id, date: { $gte: startOfDay, $lte: endOfDay } }, { $pull: { slots: { start: startTime } } });
            if (reault.modifiedCount > 0)
                return true;
            return false;
        }
        catch (error) {
            throw error;
        }
    }
    async cancelAppointment(id, date, startTime) {
        const startOfDay = (0, moment_1.default)(date).startOf("day").toDate();
        const endOfDay = (0, moment_1.default)(date).endOf("day").toDate();
        try {
            const result = await AppointmentSchema_1.default.findOneAndUpdate({
                $and: [
                    { docId: id },
                    { date: { $gte: startOfDay, $lte: endOfDay } },
                    { start: startTime },
                ],
            }, { status: "cancelled" }, {
                new: true,
            });
            if (result) {
                return {
                    status: true,
                    amount: result.amount,
                    id: result._id,
                    userId: result.userId,
                };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async doctorWalletUpdate(docId, appointmentId, amount, type, reason, paymentMethod) {
        const amountNum = Number(amount);
        try {
            const result = await DoctorWalletSchema_1.default.findOneAndUpdate({ doctorId: docId }, {
                $inc: {
                    balance: type === "credit" ? amountNum : -amountNum,
                    transactionCount: 1,
                },
                $push: {
                    transactions: {
                        appointment: appointmentId,
                        amount: amountNum,
                        type: type,
                        reason: reason,
                        paymentMethod,
                    },
                },
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            });
            if (result)
                return true;
            else
                return false;
        }
        catch (error) {
            throw error;
        }
    }
    async userWalletUpdate(userId, appointmentId, amount, type, reason, paymentMethod) {
        const amountNum = Number(amount);
        try {
            const result = await UserWalletSchema_1.default.findOneAndUpdate({ userId }, {
                $inc: {
                    balance: type === "credit" ? amountNum : -amountNum,
                    transactionCount: 1,
                },
                $push: {
                    transactions: {
                        appointment: appointmentId,
                        amount: amountNum,
                        type: type,
                        reason: reason,
                        paymentMethod,
                    },
                },
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            });
            if (result.__v == 0) {
                await UserSchema_1.default.updateOne({ _id: userId }, { $set: { wallet: result._id } });
            }
            if (result)
                return true;
            else
                return false;
        }
        catch (error) {
            throw error;
        }
    }
    async createCancelledAppointment(docId, appointmentId, amount, cancelledBy, reason) {
        try {
            const result = await cancelledAppointmentSchema_1.default.create({
                appointmentId: appointmentId,
                docId: docId,
                amount: amount,
                cancelledBy,
                reason,
            });
            if (result)
                return true;
            else
                return false;
        }
        catch (error) {
            throw error;
        }
    }
    async getAppointmentDetail(id) {
        try {
            console.log("id", id);
            const result = await AppointmentSchema_1.default.aggregate([
                { $match: { _id: new mongoose_1.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userInfo",
                    },
                },
                { $unwind: "$userInfo" },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        start: 1,
                        docId: 1,
                        end: 1,
                        status: 1,
                        userId: "$userInfo._id",
                        userName: "$userInfo.name",
                        dob: "$userInfo.dob",
                        image: "$userInfo.image",
                        city: "$userInfo.address.city",
                        state: "$userInfo.address.state",
                        prescription: 1,
                        bloodGroup: "$userInfo.bloodGroup",
                    },
                },
            ]);
            console.log("result", result);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async addPrescription(appointmentId, prescription) {
        try {
            const result = await AppointmentSchema_1.default.updateOne({ _id: appointmentId }, { $set: { prescription, status: "completed" } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async getYearlyRevenue(id) {
        try {
            const revenue = await DoctorWalletSchema_1.default.aggregate([
                {
                    $match: { doctorId: id },
                },
                {
                    $unwind: "$transactions",
                },
                {
                    $match: {
                        "transactions.type": "credit",
                    },
                },
                {
                    $group: {
                        _id: {
                            $year: "$transactions.date",
                        },
                        totalRevenue: { $sum: "$transactions.amount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            return revenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getMonthlyRevenue(id) {
        const currentYear = new Date().getFullYear();
        try {
            const revenue = await DoctorWalletSchema_1.default.aggregate([
                {
                    $match: {
                        doctorId: id,
                    },
                },
                {
                    $unwind: "$transactions",
                },
                {
                    $match: {
                        "transactions.date": {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`),
                        },
                        "transactions.type": "credit",
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$transactions.date" },
                            month: { $month: "$transactions.date" },
                        },
                        totalRevenue: { $sum: "$transactions.amount" },
                    },
                },
                {
                    $sort: {
                        "_id.month": 1,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: {
                            $arrayElemAt: [
                                [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                ],
                                { $subtract: ["$_id.month", 1] },
                            ],
                        },
                        totalRevenue: 1,
                    },
                },
            ]);
            return revenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getWeeklyAppointmentCount(id) {
        try {
            const { startOfWeek, endOfWeek } = (0, dates_1.getCurrentWeekDates)();
            console.log(id);
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        docId: id,
                        date: {
                            $gte: startOfWeek,
                            $lte: endOfWeek,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1,
                    },
                },
            ]);
            const stats = {
                appointmentsCount: 0,
                cancellationsCount: 0,
            };
            result?.forEach((entry) => {
                if (entry.status === "completed" || entry.status === "pending") {
                    stats.appointmentsCount += entry.count;
                }
                else if (entry.status === "cancelled") {
                    stats.cancellationsCount = entry.count;
                }
            });
            return stats;
        }
        catch (error) {
            throw error;
        }
    }
    async getMonthlyAppointmentCount(id) {
        try {
            const { startOfMonth, endOfMonth } = (0, dates_1.getCurrentMonthDates)();
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        docId: id,
                        date: {
                            $gte: startOfMonth,
                            $lte: endOfMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1,
                    },
                },
            ]);
            const stats = {
                appointmentsCount: 0,
                cancellationsCount: 0,
            };
            result?.forEach((entry) => {
                if (entry.status === "completed" || entry.status === "pending") {
                    stats.appointmentsCount += entry.count;
                }
                else if (entry.status === "cancelled") {
                    stats.cancellationsCount = entry.count;
                }
            });
            return stats;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorRepository;
