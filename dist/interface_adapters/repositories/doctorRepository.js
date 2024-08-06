"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TempDoctor_1 = __importDefault(require("../../frameworks/mongoose/models/TempDoctor"));
const departmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/departmentSchema"));
const DoctorSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSchema"));
const RejectedDoctor_1 = __importDefault(require("../../frameworks/mongoose/models/RejectedDoctor"));
const DoctorSlotsSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSlotsSchema"));
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
            if (otpDoc) {
                return { status: true };
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
            const result = await DoctorSchema_1.default.updateOne({ _id: id }, { $set: { name: data.name, phone: data.phone, description: data.description, fees: data.fees, degree: data.degree, complete: true } });
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
    async getSlot(date) {
        try {
            const result = await DoctorSlotsSchema_1.default.findOne({ date: date });
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
                slots: data.slots.map((slot) => ({ start: slot.start, end: slot.end }))
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
}
exports.default = DoctorRepository;
