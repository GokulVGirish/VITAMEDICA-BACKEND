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
            // Correct mapping for day names
            const dayNames = [
                "Sunday", // 1 -> Sunday
                "Monday", // 2 -> Monday
                "Tuesday", // 3 -> Tuesday
                "Wednesday", // 4 -> Wednesday
                "Thursday", // 5 -> Thursday
                "Friday", // 6 -> Friday
                "Saturday", // 7 -> Saturday
            ];
            // Ensure correct labels
            const formattedWeeklyRevenue = weeklyRevenue.map((item) => ({
                label: dayNames[item._id - 1], // Adjust using dayNames array index
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
            const startOfYear = new Date(new Date().getFullYear(), 0, 1); // January 1st of the current year
            const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // December 31st of the current year
            const monthlyRevenue = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYear,
                            $lte: endOfYear,
                        },
                        paymentStatus: "captured", // Consider only successful payments
                    },
                },
                // Create a new field for the month of the year (1=January, 2=February, ..., 12=December)
                {
                    $addFields: {
                        month: { $month: "$date" },
                    },
                },
                // Calculate net revenue (amount - fees) and group by month
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
                // Sort results by month
                {
                    $sort: { _id: 1 },
                },
            ]);
            // Map the results to a more readable format (month names instead of numbers)
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
    async getDoctorsCount() {
        try {
            const result = (await DoctorSchema_1.default.countDocuments({ status: "Verified" }));
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getUnverifiedDoctorsCount() {
        try {
            const result = await DoctorSchema_1.default.countDocuments({ status: "Pending" });
            return result;
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
}
exports.default = AdminRepository;
