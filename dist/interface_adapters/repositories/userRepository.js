"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OtpSchema_1 = __importDefault(require("../../frameworks/mongoose/models/OtpSchema"));
const UserSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserSchema"));
const DoctorSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSchema"));
const DoctorSlotsSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorSlotsSchema"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppointmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/AppointmentSchema"));
const DoctorWalletSchema_1 = __importDefault(require("../../frameworks/mongoose/models/DoctorWalletSchema"));
const UserWalletSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserWalletSchema"));
const cancelledAppointmentSchema_1 = __importDefault(require("../../frameworks/mongoose/models/cancelledAppointmentSchema"));
const moment = require("moment");
class UserRepository {
    async tempOtpUser(data) {
        try {
            const tempUser = await OtpSchema_1.default.create(data);
            return { userId: tempUser._id };
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
            const result = await DoctorSchema_1.default.aggregate([
                {
                    $match: { status: "Verified", complete: true },
                },
                {
                    $set: {
                        reviews: { $ifNull: ["$reviews", []] },
                    },
                },
                {
                    $addFields: {
                        averageRating: { $avg: "$reviews.rating" },
                        totalReviews: { $size: "$reviews" },
                    },
                },
                {
                    $lookup: {
                        from: "departments",
                        localField: "department",
                        foreignField: "_id",
                        as: "department",
                    },
                },
                {
                    $unwind: "$department",
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        department: { name: 1 },
                        image: 1,
                        degree: 1,
                        fees: 1,
                        averageRating: 1,
                        totalReviews: 1,
                    },
                },
                { $skip: skip },
                { $limit: limit },
            ]);
            const totalDoctors = await DoctorSchema_1.default.countDocuments({
                status: "Verified",
                complete: true,
            });
            return { doctors: result, totalPages: Math.ceil(totalDoctors / limit) };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorsByCategory(category, skip, limit) {
        try {
            const result = await DoctorSchema_1.default
                .find({ status: "Verified", complete: true, department: category })
                .skip(skip)
                .limit(limit)
                .lean()
                .populate({ path: "department", select: "name" })
                .select("_id name department image degree fees");
            const totalDoctors = await DoctorSchema_1.default.countDocuments({
                status: "Verified",
                complete: true,
                department: category,
            });
            return {
                doctors: result,
                totalPages: Math.ceil(totalDoctors / limit),
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorBySearch(searchKey) {
        try {
            const response = await DoctorSchema_1.default
                .find({
                $and: [
                    { name: { $regex: searchKey } },
                    { status: "Verified" },
                    { complete: true },
                ],
            })
                .lean()
                .populate({ path: "department", select: "name" })
                .select("_id name department image degree fees");
            return response;
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
                $inc: {
                    balance: type === "credit" ? amount : -amount,
                    transactionCount: 1,
                },
                $push: {
                    transactions: {
                        appointment: appointmentId,
                        amount: amount,
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
    async getAppointments(page, limit, userId) {
        try {
            const result = await AppointmentSchema_1.default.aggregate([
                { $match: { userId: userId } },
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
                    $project: {
                        _id: 1,
                        date: 1,
                        status: 1,
                        start: 1,
                        end: 1,
                        doctorName: "$doctorInfo.name",
                        paymentStatus: 1,
                        amount: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);
            const totalAppointments = await AppointmentSchema_1.default.countDocuments({
                userId,
            });
            if (result.length !== 0)
                return {
                    status: true,
                    appointments: result,
                    totalPages: Math.ceil(totalAppointments / limit),
                };
            return { status: false };
        }
        catch (error) {
            throw error;
        }
    }
    async userWalletInfo(page, limit, userId) {
        try {
            const result = await UserWalletSchema_1.default.aggregate([
                { $match: { userId } },
                {
                    $project: {
                        _id: 1,
                        balance: 1,
                        transactionCount: 1,
                        transactions: {
                            $slice: [
                                { $reverseArray: "$transactions" },
                                (page - 1) * limit,
                                limit,
                            ],
                        },
                    },
                },
            ]);
            if (!result || result.length === 0) {
                return { status: false };
            }
            const totalPages = Math.ceil(result[0].transactionCount / limit);
            return {
                status: true,
                userWallet: result[0],
                totalPages: totalPages,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async cancelAppointment(appointmentId) {
        try {
            const response = await AppointmentSchema_1.default.findOneAndUpdate({ _id: appointmentId }, { status: "cancelled" }, { new: true });
            if (response) {
                return { status: true, amount: response.amount, docId: response.docId };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async unbookSlot(docId, date, startTime) {
        try {
            const result = await DoctorSlotsSchema_1.default.updateOne({
                doctorId: docId,
                date: date,
            }, {
                $set: {
                    "slots.$[slot].bookedBy": null,
                    "slots.$[slot].availability": true,
                    "slots.$[slot].locked": false,
                    "slots.$[slot].lockedBy": null,
                    "slots.$[slot].lockExpiration": null,
                },
            }, {
                arrayFilters: [{ "slot.start": startTime }],
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async createCancelledAppointment(docId, appointmentId, amount, cancelledBy, reason) {
        try {
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
        catch (error) {
            throw error;
        }
    }
    async userWalletUpdate(userId, appointmentId, amount, type, reason, paymentMethod) {
        try {
            try {
                const result = await UserWalletSchema_1.default.findOneAndUpdate({ userId: userId }, {
                    $inc: {
                        balance: type === "credit" ? amount : -amount,
                        transactionCount: 1,
                    },
                    $push: {
                        transactions: {
                            appointment: appointmentId,
                            amount: amount,
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
        catch (error) {
            throw error;
        }
    }
    async getAppointment(appoinmentId) {
        try {
            const appointment = await AppointmentSchema_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(appoinmentId),
                    },
                },
                {
                    $lookup: {
                        localField: "docId",
                        foreignField: "_id",
                        from: "doctors",
                        as: "docInfo",
                    },
                },
                {
                    $unwind: "$docInfo",
                },
                {
                    $lookup: {
                        localField: "docInfo.department",
                        foreignField: "_id",
                        from: "departments",
                        as: "depatmentInfo",
                    },
                },
                {
                    $unwind: "$depatmentInfo",
                },
                {
                    $project: {
                        _id: 0,
                        date: 1,
                        start: 1,
                        end: 1,
                        amount: 1,
                        prescription: 1,
                        createdAt: 1,
                        docName: "$docInfo.name",
                        docImage: "$docInfo.image",
                        status: 1,
                        docDegree: "$docInfo.degree",
                    },
                },
            ]);
            return appointment[0];
        }
        catch (error) {
            throw error;
        }
    }
    async addReview(appointmentId, userId, docId, rating, description) {
        try {
            const result = await DoctorSchema_1.default.updateOne({ _id: docId }, {
                $push: {
                    reviews: {
                        appointmentId,
                        userId,
                        rating,
                        comment: description || "",
                    },
                },
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchDoctorRating(id, page, limit) {
        console.log("id", id, page, limit);
        const skipReviews = (page - 1) * limit;
        try {
            const result = await DoctorSchema_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(id),
                    },
                },
                {
                    $unwind: "$reviews",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "reviews.userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$userDetails",
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
                        averageRating: { $avg: "$reviews.rating" },
                        totalReviews: { $sum: 1 },
                        reviews: {
                            $push: {
                                rating: "$reviews.rating",
                                comment: "$reviews.comment",
                                createdAt: "$reviews.createdAt",
                                userId: "$reviews.userId",
                                userName: "$userDetails.name",
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        averageRating: 1,
                        totalReviews: 1,
                        reviews: { $slice: ["$reviews", skipReviews, limit] },
                    },
                },
            ]);
            return result[0];
        }
        catch (error) {
            throw error;
        }
    }
    async fetchFavoriteDoctors(id) {
        try {
            const result = await UserSchema_1.default.aggregate([
                {
                    $match: { _id: new mongoose_1.default.Types.ObjectId(id) },
                },
                {
                    $set: {
                        favorites: { $ifNull: ["$favorites", []] },
                    },
                },
            ]);
            return result[0].favorites;
        }
        catch (error) {
            throw error;
        }
    }
    async removeDoctorFavorites(userId, docId) {
        try {
            const result = await UserSchema_1.default.updateOne({ _id: userId }, { $pull: { favorites: new mongoose_1.default.Types.ObjectId(docId) } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async addDoctorFavorites(userId, docId) {
        try {
            const result = await UserSchema_1.default.updateOne({ _id: userId }, { $addToSet: { favorites: new mongoose_1.default.Types.ObjectId(docId) } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async getFavoriteDoctorsList(userId, skip, limit) {
        try {
            const favoriteDoctors = await UserSchema_1.default.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(userId)
                    }
                },
                {
                    $set: {
                        favorites: {
                            $ifNull: ["$favorites", []]
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        favorites: 1
                    }
                }
            ]);
            const favorites = favoriteDoctors[0].favorites;
            if (favorites.length === 0)
                return { status: false };
            const doctors = await DoctorSchema_1.default.aggregate([
                {
                    $match: {
                        _id: { $in: favorites },
                    },
                },
                {
                    $facet: {
                        data: [
                            {
                                $set: {
                                    reviews: { $ifNull: ["$reviews", []] },
                                },
                            },
                            {
                                $addFields: {
                                    averageRating: {
                                        $avg: "$reviews.rating",
                                    },
                                    totalReviews: {
                                        $size: "$reviews",
                                    },
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
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    department: { name: "$departmentInfo.name" },
                                    image: 1,
                                    degree: 1,
                                    fees: 1,
                                    averageRating: 1,
                                    totalReviews: 1,
                                },
                            },
                            {
                                $skip: skip,
                            },
                            {
                                $limit: limit,
                            },
                        ],
                        count: [
                            {
                                $count: "count",
                            },
                        ],
                    },
                },
                {
                    $unwind: "$count",
                },
                {
                    $project: {
                        data: 1,
                        count: "$count.count",
                    },
                },
            ]);
            return { status: true, doctors: doctors[0].data, totalPages: doctors[0].count };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = UserRepository;
