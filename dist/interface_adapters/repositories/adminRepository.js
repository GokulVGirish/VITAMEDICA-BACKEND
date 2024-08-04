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
                    status: false
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
                reason: reason
            });
            return result ? true : false;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminRepository;
