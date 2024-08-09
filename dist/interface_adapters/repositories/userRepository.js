"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OtpSchema_1 = __importDefault(require("../../frameworks/mongoose/models/OtpSchema"));
const UserSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserSchema"));
const DoctorSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSchema"));
const DoctorSlotsSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSlotsSchema"));
const AppointmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/AppointmentSchema"));
const DoctorWalletSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorWalletSchema"));
const moment = require("moment");
class UserRepository {
    async tempOtpUser(data) {
        try {
            const tempUser = await OtpSchema_1.default.create(data);
            if (tempUser) {
                return { status: true };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async userExist(email) {
        const user = await UserSchema_1.default.findOne({ email: email });
        return !!user;
    }
    async createUserOtp(otp) {
        try {
            const otpUser = await OtpSchema_1.default.findOne({ otp: otp });
            if (otpUser) {
                const now = new Date();
                const expirationTime = new Date(otpUser?.time.getTime() + 2 * 60 * 1000);
                if (now < expirationTime) {
                    const user = await UserSchema_1.default.create({
                        name: otpUser.name,
                        email: otpUser.email,
                        phone: otpUser.phone,
                        password: otpUser.password,
                        gender: otpUser.gender,
                        bloodGroup: otpUser.bloodGroup,
                        dob: otpUser.dob,
                    });
                    return { status: true, user };
                }
                else {
                    return { status: false };
                }
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
    async getUser(email) {
        try {
            const user = await UserSchema_1.default.findOne({ email: email });
            return user;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async googleSignup(email, name, password) {
        try {
            const user = await UserSchema_1.default.create({
                name: name,
                email: email,
                password: password,
                register: "Google",
            });
            if (user) {
                return {
                    status: true,
                    message: "Signed Up Sucessfully",
                };
            }
            else {
                return {
                    status: false,
                    message: "error signing up",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateProfile(userId, data) {
        try {
            const response = await UserSchema_1.default.updateOne({ _id: userId }, {
                name: data.name,
                phone: data.phone,
                dob: data.dob,
                gender: data.gender,
                bloodGroup: data.bloodGroup,
                address: {
                    street: data.address?.street,
                    city: data.address?.city,
                    state: data.address?.state,
                    postalCode: data.address?.postalCode,
                },
            });
            console.log("response", response);
            if (response.modifiedCount > 0) {
                return { success: true };
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async resendOtp(otp, email) {
        try {
            const otpDoc = await OtpSchema_1.default.findOne({ email: email });
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
            const result = await UserSchema_1.default.updateOne({ _id: id }, { $set: { image: imagePath } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async resetPassword(email, password) {
        try {
            const result = await UserSchema_1.default.updateOne({ email: email }, { $set: { password: password } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctors(skip, limit) {
        try {
            const result = await DoctorSchema_1.default
                .find({ status: "Verified", complete: true }).skip(skip).limit(limit)
                .lean()
                .populate({ path: "department", select: "name" })
                .select("_id name department image degree fees");
            const totalDoctors = await DoctorSchema_1.default.countDocuments();
            return { doctors: result, totalPages: Math.ceil(totalDoctors / limit) };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctor(id) {
        try {
            const result = await DoctorSchema_1.default
                .findOne({ _id: id })
                .lean()
                .populate({ path: "department", select: "name" })
                .select("_id name department image degree fees description");
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getSlots(id) {
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
            console.log("id", id, "date", date);
            const startOfDay = moment(date).startOf("day").toDate();
            const endOfDay = moment(date).endOf("day").toDate();
            const result = await DoctorSlotsSchema_1.default.findOne({
                doctorId: id,
                date: { $gte: startOfDay, $lte: endOfDay },
            });
            console.log("second result", result);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async lockSlot(userId, docId, date, slotId, lockExpiration) {
        console.log("userId", userId, "slotId", slotId, "doctorId", docId, "date", date);
        try {
            const startOfDay = moment(date).startOf("day").toDate();
            const endOfDay = moment(date).endOf("day").toDate();
            const initialCheck = await DoctorSlotsSchema_1.default.findOne({
                $and: [
                    { doctorId: docId },
                    { date: { $gte: startOfDay, $lte: endOfDay } },
                    {
                        slots: {
                            $elemMatch: { _id: slotId, locked: true },
                        },
                    },
                ],
            });
            console.log("initialCHeck", initialCheck);
            if (initialCheck)
                return false;
            console.log("initialCHeck", initialCheck);
            const result = await DoctorSlotsSchema_1.default.findOneAndUpdate({
                doctorId: docId,
                date: { $gte: startOfDay, $lte: endOfDay },
                $and: [{ "slots._id": slotId }, { "slots.locked": false }],
            }, {
                $set: {
                    "slots.$[slot].locked": true,
                    "slots.$[slot].lockedBy": userId,
                    "slots.$[slot].lockExpiration": lockExpiration,
                },
            }, {
                arrayFilters: [{ "slot._id": slotId }],
                new: true,
                runValidators: true,
            });
            if (!result) {
                console.log("Slot locking failed: already locked or not available");
                return false;
            }
            return true;
        }
        catch (error) {
            console.error("Error locking slot:", error);
            throw error;
        }
    }
    async bookSlot(doctorId, userId, slotId, date) {
        console.log("next", "...", "docId", doctorId, "userId", userId, "slotId", slotId, "date", date);
        try {
            const now = new Date();
            const startOfDay = moment(date).startOf("day").toDate();
            const endOfDay = moment(date).endOf("day").toDate();
            const result = await DoctorSlotsSchema_1.default.findOneAndUpdate({
                doctorId: doctorId,
                date: { $gte: startOfDay, $lte: endOfDay },
                "slots._id": slotId,
                "slots.locked": true,
                "slots.availability": true,
                "slots.lockedBy": userId,
                "slots.lockExpiration": { $gt: now },
            }, {
                $set: {
                    "slots.$[slot].availability": false,
                    "slots.$[slot].bookedBy": userId,
                    "slots.$[slot].locked": false,
                    "slots.$[slot].lockedBy": null,
                    "slots.$[slot].lockExpiration": null,
                },
            }, {
                arrayFilters: [{ "slot._id": slotId }],
                new: true,
                runValidators: true,
            });
            if (result)
                return true;
            return false;
        }
        catch (error) {
            console.error("Error booking slot:", error);
            throw error;
        }
    }
    async createAppointment(userId, docId, date, start, end, amount, paymentId, fees) {
        try {
            const result = await AppointmentSchema_1.default.create({
                docId: docId,
                userId: userId,
                date: date,
                start,
                end,
                amount,
                fees,
                paymentId,
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async doctorWalletUpdate(docId, appointmentId, amount, type, reason, paymentMethod) {
        try {
            const result = await DoctorWalletSchema_1.default.findOneAndUpdate({ doctorId: docId }, {
                $inc: { balance: type === "credit" ? amount : -amount },
                $push: {
                    transactions: {
                        appointment: appointmentId,
                        amount: amount,
                        type: "credit",
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
                await DoctorSchema_1.default.updateOne({ _id: docId }, { $set: { wallet: result._id } });
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
}
exports.default = UserRepository;
