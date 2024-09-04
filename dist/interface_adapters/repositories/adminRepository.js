"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminSchema_1 = __importDefault(require("../../frameworks/mongoose/models/AdminSchema"));
const departmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/departmentSchema"));
const DoctorSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSchema"));
const UserSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserSchema"));
const RejectedDoctor_1 = __importDefault(require("../../frameworks/mongoose/models/RejectedDoctor"));
const dates_1 = require("../../frameworks/services/dates");
const AppointmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/AppointmentSchema"));
const mongoose_1 = __importDefault(require("mongoose"));
class AdminRepository {
    async getAdmin(email) {
        const admin = await AdminSchema_1.default.findOne({ email: email });
        return admin;
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
    async addDepartment(name) {
        try {
            const department = await departmentSchema_1.default.create({ name: name });
            if (!department) {
                return { status: false };
            }
            return { status: true, department };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteDepartment(id) {
        try {
            const result = await departmentSchema_1.default.deleteOne({ _id: id });
            if (result.deletedCount === 1) {
                return {
                    status: true,
                    message: "Department deleted successfully",
                };
            }
            else {
                return {
                    status: false,
                    message: "Department not found or could not be deleted",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getUsers() {
        try {
            const users = await UserSchema_1.default.find();
            if (!users) {
                return { status: false, message: "error retriving users" };
            }
            return { status: true, message: "sucessful", users };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async blockUnblockUser(id, status) {
        try {
            const result = await UserSchema_1.default.updateOne({ _id: id }, { $set: { isBlocked: status } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getUnverifiedDoctors() {
        try {
            const result = await DoctorSchema_1.default.aggregate([
                {
                    $match: {
                        documentsUploaded: true,
                        status: "Submitted",
                    },
                },
                {
                    $lookup: {
                        from: "departments", // The name of the department collection
                        localField: "department",
                        foreignField: "_id",
                        as: "department",
                    },
                },
                {
                    $unwind: {
                        path: "$department",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        email: { $first: "$email" }
                    },
                },
            ]);
            return { status: true, doctors: result };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDoctor(id) {
        try {
            const result = await DoctorSchema_1.default
                .findOne({ _id: id })
                .populate("department");
            if (result) {
                return { status: true, doctor: result };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async verifyDoctor(id) {
        try {
            const result = await DoctorSchema_1.default.updateOne({ _id: id }, { $set: { status: "Verified" } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctors() {
        try {
            const doctors = await DoctorSchema_1.default.find({ status: "Verified" });
            if (doctors) {
                return { status: true, doctors: doctors };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async blockUnblockDoctor(id, status) {
        try {
            const result = await DoctorSchema_1.default.updateOne({ _id: id }, { $set: { isBlocked: status } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteDoctor(id) {
        try {
            const result = await DoctorSchema_1.default.deleteOne({ _id: id });
            return result.deletedCount === 1;
        }
        catch (error) {
            throw error;
        }
    }
    async createRejectedDoctor(email, reason) {
        try {
            const result = await RejectedDoctor_1.default.create({
                email: email,
                reason: reason,
            });
            return result ? true : false;
        }
        catch (error) {
            throw error;
        }
    }
    async getWeeklyRevenue() {
        try {
            const { startOfWeek, endOfWeek } = (0, dates_1.getCurrentWeekDates)();
            const weeklyRevenue = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfWeek,
                            $lte: endOfWeek,
                        },
                        paymentStatus: "captured",
                    },
                },
                {
                    $addFields: {
                        dayOfWeek: { $dayOfWeek: "$createdAt" }, // Ensure this uses createdAt or appropriate date field
                    },
                },
                {
                    $group: {
                        _id: "$dayOfWeek",
                        totalRevenue: {
                            $sum: {
                                $toDouble: "$amount",
                            },
                        },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);
            const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            const formattedWeeklyRevenue = weeklyRevenue.map((item) => ({
                label: dayNames[item._id - 1],
                totalRevenue: item.totalRevenue,
            }));
            return formattedWeeklyRevenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getWeeklyAppointmentCount() {
        try {
            const { startOfWeek, endOfWeek } = (0, dates_1.getCurrentWeekDates)();
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
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
    async getMonthlyRevenue() {
        try {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
            const monthlyRevenue = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYear,
                            $lte: endOfYear,
                        },
                        paymentStatus: "captured",
                    },
                },
                {
                    $addFields: {
                        month: { $month: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$month",
                        totalRevenue: {
                            $sum: {
                                $toDouble: "$amount"
                            },
                        },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);
            const monthNames = [
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
            ];
            const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
                label: monthNames[item._id - 1],
                totalRevenue: item.totalRevenue,
            }));
            return formattedMonthlyRevenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getMonthlyAppointmentCount() {
        try {
            const { startOfMonth, endOfMonth } = (0, dates_1.getCurrentMonthDates)();
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
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
    async getYearlyRevenue() {
        try {
            const yearlyRevenue = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        paymentStatus: "captured",
                    },
                },
                {
                    $group: {
                        _id: { label: { $year: "$date" } },
                        totalRevenue: {
                            $sum: {
                                $toDouble: "$amount"
                            },
                        },
                    },
                },
                {
                    $project: {
                        label: "$_id.label",
                        _id: 0,
                        totalRevenue: 1,
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);
            return yearlyRevenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getTodaysRevenue() {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfDay,
                            $lte: endOfDay,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $toDouble: "$amount",
                            },
                        },
                    },
                },
            ]);
            const totalAmount = result.length > 0 ? result[0].totalRevenue : 0;
            return totalAmount;
        }
        catch (error) {
            throw error;
        }
    }
    async getTodaysAppointmentCount() {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfDay,
                            $lte: endOfDay,
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
    async getUsersCount() {
        try {
            const result = await UserSchema_1.default.countDocuments({});
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorCount() {
        try {
            const result = await DoctorSchema_1.default.aggregate([
                {
                    $facet: {
                        doctorCount: [
                            {
                                $match: { status: "Verified" },
                            },
                            {
                                $count: "count",
                            },
                        ],
                        unverifiedDoctorCount: [
                            {
                                $match: { status: "Submitted" },
                            },
                            {
                                $count: "count",
                            },
                        ],
                    },
                },
                {
                    $addFields: {
                        doctorCount: { $arrayElemAt: ["$doctorCount.count", 0] },
                        unverifiedDoctorCount: {
                            $arrayElemAt: ["$unverifiedDoctorCount.count", 0],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        doctorCount: { $ifNull: ["$doctorCount", 0] },
                        unverifiedDoctorCount: { $ifNull: ["$unverifiedDoctorCount", 0] },
                    },
                },
            ]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async fetchAppointments(page, limit, startDate, endDate) {
        try {
            const skip = (page - 1) * limit;
            let sortCondition = -1;
            let matchCondition = {};
            if (startDate && endDate) {
                matchCondition.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
                sortCondition = 1;
            }
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $facet: {
                        data: [
                            {
                                $match: matchCondition
                            },
                            {
                                $sort: {
                                    createdAt: sortCondition,
                                },
                            },
                            {
                                $lookup: {
                                    from: "doctors",
                                    localField: "docId",
                                    foreignField: "_id",
                                    as: "doctorInfo",
                                },
                            },
                            {
                                $unwind: "$doctorInfo",
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
                                $lookup: {
                                    from: "departments",
                                    localField: "doctorInfo.department",
                                    foreignField: "_id",
                                    as: "departmentInfo",
                                },
                            },
                            {
                                $unwind: "$departmentInfo",
                            },
                            {
                                $project: {
                                    _id: 1,
                                    date: 1,
                                    start: 1,
                                    end: 1,
                                    amount: 1,
                                    status: 1,
                                    docName: "$doctorInfo.name",
                                    department: "$departmentInfo.name",
                                    userName: "$userInfo.name",
                                },
                            },
                            {
                                $skip: skip,
                            },
                            {
                                $limit: limit,
                            },
                        ],
                        totalCount: [
                            {
                                $match: matchCondition
                            },
                            {
                                $count: "count",
                            },
                        ],
                    },
                },
                {
                    $unwind: "$totalCount"
                },
                {
                    $project: {
                        data: 1,
                        totalCount: "$totalCount.count"
                    }
                }
            ]);
            console.log("result", result);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchAppointmentDetail(id) {
        try {
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "docId",
                        foreignField: "_id",
                        as: "docInfo",
                    },
                },
                {
                    $unwind: "$docInfo",
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
                    $lookup: {
                        from: "departments",
                        localField: "docInfo.department",
                        foreignField: "_id",
                        as: "departmentInfo",
                    },
                },
                {
                    $unwind: "$departmentInfo"
                },
                {
                    $project: {
                        _id: 1,
                        amount: 1,
                        fees: 1,
                        docName: "$docInfo.name",
                        userName: "$userInfo.name",
                        userAge: "$userInfo.dob",
                        userBlood: "$userInfo.bloodGroup",
                        status: 1,
                        date: 1,
                        createdAt: 1,
                        start: 1,
                        end: 1,
                        review: 1,
                        prescription: 1,
                        department: "$departmentInfo.name",
                        docImage: "$docInfo.image",
                        userImage: "$userInfo.image"
                    },
                },
            ]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorProfile(id, page, limit) {
        try {
            const skip = (page - 1) * limit;
            const result = await DoctorSchema_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: "departments",
                        localField: "department",
                        foreignField: "_id",
                        as: "departmentInfo",
                    },
                },
                {
                    $unwind: "$departmentInfo",
                },
                {
                    $set: {
                        reviews: {
                            $ifNull: ["$reviews", []],
                        },
                    },
                },
                {
                    $addFields: {
                        totalReviews: { $size: "$reviews" },
                        averageRating: { $avg: "$reviews.rating" },
                    },
                },
                {
                    $unwind: {
                        path: "$reviews",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: {
                        "reviews.createdAt": -1,
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        email: { $first: "$email" },
                        phone: { $first: "$phone" },
                        gender: { $first: "$gender" },
                        image: { $first: "$image" },
                        department: { $first: "$departmentInfo" },
                        documentsUploaded: { $first: "$documentsUploaded" },
                        documents: { $first: "$documents" },
                        wallet: { $first: "$wallet" },
                        degree: { $first: "$degree" },
                        fees: { $first: "$fees" },
                        complete: { $first: "$complete" },
                        description: { $first: "$description" },
                        status: { $first: "$status" },
                        isBlocked: { $first: "$isBlocked" },
                        totalReviews: { $first: "$totalReviews" },
                        averageRating: { $first: "$averageRating" },
                        reviews: { $push: "$reviews" },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        phone: 1,
                        gender: 1,
                        image: 1,
                        department: "$department.name",
                        documentsUploaded: 1,
                        documents: 1,
                        degree: 1,
                        fees: 1,
                        description: 1,
                        isBlocked: 1,
                        reviews: {
                            $slice: ["$reviews", skip, limit]
                        },
                        totalReviews: 1,
                        averageRating: 1,
                    },
                },
            ]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async getUserProfile(id) {
        try {
            const result = await UserSchema_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        phone: 1,
                        dob: 1,
                        gender: 1,
                        address: 1,
                        bloodGroup: 1,
                        register: 1,
                        image: 1,
                        isBlocked: 1
                    }
                }
            ]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorAppointments(id, page, limit) {
        try {
            const skip = (page - 1) * limit;
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        docId: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                {
                    $facet: {
                        data: [
                            {
                                $sort: {
                                    createdAt: -1,
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
                                $skip: skip,
                            },
                            {
                                $limit: limit,
                            },
                            {
                                $project: {
                                    _id: 1,
                                    date: 1,
                                    start: 1,
                                    end: 1,
                                    createdAt: 1,
                                    fees: 1,
                                    status: 1,
                                    userName: "$userInfo.name",
                                },
                            },
                        ],
                        totalCount: [{ $count: "count" }],
                    },
                },
                {
                    $unwind: "$totalCount"
                }
            ]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async getUserAppointments(id, page, limit) {
        try {
            const skip = (page - 1) * limit;
            console.log("skip", skip);
            const result = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                {
                    $facet: {
                        data: [
                            {
                                $sort: { createdAt: -1 },
                            },
                            {
                                $lookup: {
                                    from: "doctors",
                                    localField: "docId",
                                    foreignField: "_id",
                                    as: "doctorInfo",
                                },
                            },
                            {
                                $unwind: "$doctorInfo",
                            },
                            {
                                $skip: skip,
                            },
                            {
                                $limit: limit,
                            },
                            {
                                $project: {
                                    _id: 1,
                                    date: 1,
                                    start: 1,
                                    end: 1,
                                    createdAt: 1,
                                    fees: 1,
                                    status: 1,
                                    doctorName: "$doctorInfo.name",
                                },
                            },
                        ],
                        totalCount: [{ $count: "count" }]
                    },
                },
                {
                    $unwind: "$totalCount"
                },
                {
                    $project: {
                        data: "$data",
                        count: "$totalCount.count"
                    }
                }
            ]);
            console.log("result", result);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminRepository;
