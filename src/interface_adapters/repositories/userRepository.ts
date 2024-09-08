import IUserRepository from "../../entities/irepositories/iuserRepository";
import otpModel from "../../frameworks/mongoose/models/OtpSchema";
import { MongoUser, User } from "../../entities/rules/user";
import userModel from "../../frameworks/mongoose/models/UserSchema";
import { Types } from "mongoose";
import { MongoDoctor, Review } from "../../entities/rules/doctor";
import doctorModel from "../../frameworks/mongoose/models/DoctorSchema";
import { DoctorSlots } from "../../entities/rules/slotsType";
import doctorSlotsModel from "../../frameworks/mongoose/models/DoctorSlotsSchema";
import mongoose from "mongoose";
import appointmentModel from "../../frameworks/mongoose/models/AppointmentSchema";
import IAppointment from "../../entities/rules/appointments";
import doctorWalletModal from "../../frameworks/mongoose/models/DoctorWalletSchema";
import IUserWallet from "../../entities/rules/userWalletType";
import userWalletModal from "../../frameworks/mongoose/models/UserWalletSchema";
import cancelledAppointmentsModel from "../../frameworks/mongoose/models/cancelledAppointmentSchema";
import { count } from "console";
import chatSchemaModel from "../../frameworks/mongoose/models/ChatSchema";

const moment = require("moment");


class UserRepository implements IUserRepository {
  async tempOtpUser(data: User): Promise<{ userId: Types.ObjectId }> {
    try {
      const tempUser = await otpModel.create(data);
      return { userId: tempUser._id };
    } catch (error) {
      throw error;
    }
  }
  async userExist(email: string): Promise<boolean> {
    const user = await userModel.findOne({ email: email });
    return !!user;
  }
  async createUserOtp(otp: string): Promise<{ status: boolean; user?: any }> {
    try {
      const otpUser = await otpModel.findOne({ otp: otp });

      if (otpUser) {
        const now = new Date();
        const expirationTime = new Date(
          otpUser?.time.getTime() + 2 * 60 * 1000
        );

        if (now < expirationTime) {
          const user = await userModel.create({
            name: otpUser.name,
            email: otpUser.email,
            phone: otpUser.phone,
            password: otpUser.password,
            gender: otpUser.gender,
            bloodGroup: otpUser.bloodGroup,
            dob: otpUser.dob,
          });
          return { status: true, user };
        } else {
          return { status: false };
        }
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUser(email: string): Promise<MongoUser | null> {
    try {
      const user = await userModel.findOne({ email: email });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async googleSignup(
    email: string,
    name: string,
    password: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const user = await userModel.create({
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
      } else {
        return {
          status: false,
          message: "error signing up",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProfile(
    userId: Types.ObjectId,
    data: User
  ): Promise<{ success: boolean }> {
    try {
      const response = await userModel.updateOne(
        { _id: userId },
        {
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
        }
      );
      console.log("response", response);
      if (response.modifiedCount > 0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async resendOtp(otp: string, email: string): Promise<boolean> {
    try {
      const otpDoc = await otpModel.findOne({ email: email });
      if (otpDoc) {
        otpDoc.otp = otp;
        otpDoc.time = new Date();
        await otpDoc.save();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProfileImage(
    id: Types.ObjectId,
    imagePath: string
  ): Promise<boolean> {
    try {
      const result = await userModel.updateOne(
        { _id: id },
        { $set: { image: imagePath } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async resetPassword(email: string, password: string): Promise<boolean> {
    try {
      const result = await userModel.updateOne(
        { email: email },
        { $set: { password: password } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getDoctors(
    skip: number,
    limit: number
  ): Promise<{ doctors?: MongoDoctor[]; totalPages?: number }> {
    try {
      const result = await doctorModel.aggregate([
        {
          $match: { status: "Verified", complete: true },
        },
        {
          $facet: {
            doctors: [
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
                $addFields: {
                  averageRating: { $round: ["$averageRating", 1] },
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
                $group: {
                  _id: "$_id",
                  name: { $first: "$name" },
                  image: { $first: "$image" },
                  degree: { $first: "$degree" },
                  fees: { $first: "$fees" },
                  averageRating: { $first: "$averageRating" },
                  totalReviews: { $first: "$totalReviews" },
                  department: { $push: "$department.name" },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  department: 1,
                  image: 1,
                  degree: 1,
                  fees: 1,
                  averageRating: 1,
                  totalReviews: 1,
                },
              },
              {
                $sort: { _id: 1 },
              },
              { $skip: skip },
              { $limit: limit },
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
            doctors: 1,
            count: "$count.count",
          },
        },
      ]);
      console.log("result", result[0].doctors);

      return {
        doctors: result[0].doctors,
        totalPages: Math.ceil(result[0].count / limit),
      };
    } catch (error) {
      throw error;
    }
  }
  async getDoctorsByCategory(
    category: string,
    skip: number,
    limit: number
  ): Promise<{ doctors?: MongoDoctor[]; totalPages?: number }> {
    try {
      const newResult = await doctorModel.aggregate([
        {
          $match: {
            status: "Verified",
            complete: true,
            department: { $in: [new mongoose.Types.ObjectId(category)] },
          },
        },
        {
          $facet: {
            doctors: [
              {
                $set: {
                  reviews: {
                    $ifNull: ["$reviews", []],
                  },
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
                  as: "departmentInfo",
                },
              },
              {
                $unwind: "$departmentInfo",
              },
              {
                $group: {
                  _id: "$_id",
                  name: { $first: "$name" },
                  image: { $first: "$image" },
                  degree: { $first: "$degree" },
                  fees: { $first: "$fees" },
                  averageRating: { $first: "$averageRating" },
                  totalReviews: { $first: "$totalReviews" },
                  department: { $push: "$departmentInfo.name" },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  department: 1,
                  image: 1,
                  degree: 1,
                  fees: 1,
                  averageRating: 1,
                  totalReviews: 1,
                },
              },
              {
                $sort: { _id: 1 },
              },
              { $skip: skip },
              { $limit: limit },
            ],
            count: [{ $count: "count" }],
          },
        },
        {
          $unwind: "$count",
        },
        {
          $project: {
            doctors: 1,
            count: "$count.count",
          },
        },
      ]);

      return {
        doctors: newResult[0].doctors,

        totalPages: Math.ceil(newResult[0].count / limit),
      };
    } catch (error) {
      throw error;
    }
  }
  async getDoctorBySearch(searchKey: RegExp): Promise<MongoDoctor[] | null> {
    try {
      const response = await doctorModel
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
    } catch (error) {
      throw error;
    }
  }
  async getDoctor(id: string): Promise<MongoDoctor | null> {
    try {
      const result = await doctorModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
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
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            department: { $push: "$departmentInfo.name" },
            image: { $first: "$image" },
            degree: { $first: "$degree" },
            fees: { $first: "$fees" },
            description: { $first: "$description" },
          },
        },
      ]);
      console.log("departmentInfo", result);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getSlots(id: string): Promise<DoctorSlots[] | null> {
    try {
      const result = await doctorSlotsModel.find({
        doctorId: id,
        active: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getTimeSlots(id: string, date: string): Promise<DoctorSlots | null> {
    try {
      console.log("id", id, "date", date);
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();
      const result = await doctorSlotsModel.findOne({
        doctorId: id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      console.log("second result", result);
      return result;
    } catch (error) {
      throw error;
    }
  }
  async lockSlot(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: string,
    slotId: Types.ObjectId,
    lockExpiration: Date
  ): Promise<boolean> {
    console.log(
      "userId",
      userId,
      "slotId",
      slotId,
      "doctorId",
      docId,
      "date",
      date
    );
    try {
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();

      const initialCheck = await doctorSlotsModel.findOne({
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
      if (initialCheck) return false;
      console.log("initialCHeck", initialCheck);

      const result = await doctorSlotsModel.findOneAndUpdate(
        {
          doctorId: docId,
          date: { $gte: startOfDay, $lte: endOfDay },
          $and: [{ "slots._id": slotId }, { "slots.locked": false }],
        },
        {
          $set: {
            "slots.$[slot].locked": true,
            "slots.$[slot].lockedBy": userId,
            "slots.$[slot].lockExpiration": lockExpiration,
          },
        },
        {
          arrayFilters: [{ "slot._id": slotId }],
          new: true,
          runValidators: true,
        }
      );

      if (!result) {
        console.log("Slot locking failed: already locked or not available");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error locking slot:", error);
      throw error;
    }
  }

  async bookSlot(
    doctorId: Types.ObjectId,
    userId: Types.ObjectId,
    slotId: Types.ObjectId,
    date: string
  ): Promise<boolean> {
    console.log(
      "next",
      "...",
      "docId",
      doctorId,
      "userId",
      userId,
      "slotId",
      slotId,
      "date",
      date
    );
    try {
      const now = new Date();
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();

      const result = await doctorSlotsModel.findOneAndUpdate(
        {
          doctorId: doctorId,
          date: { $gte: startOfDay, $lte: endOfDay },
          "slots._id": slotId,
          "slots.locked": true,
          "slots.availability": true,
          "slots.lockedBy": userId,
          "slots.lockExpiration": { $gt: now },
        },
        {
          $set: {
            "slots.$[slot].availability": false,
            "slots.$[slot].bookedBy": userId,
            "slots.$[slot].locked": false,
            "slots.$[slot].lockedBy": null,
            "slots.$[slot].lockExpiration": null,
          },
        },
        {
          arrayFilters: [{ "slot._id": slotId }],
          new: true,
          runValidators: true,
        }
      );

      if (result) return true;
      return false;
    } catch (error) {
      console.error("Error booking slot:", error);
      throw error;
    }
  }

  async createAppointment(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: string,
    start: string,
    end: string,
    amount: string,
    fees: string,
    paymentMethod: string,
    paymentId?: string
  ): Promise<IAppointment> {
    try {
      const query: any = {
        docId,
        userId,
        date,
        start,
        end,
        amount,
        fees,
        paymentMethod,
      };
      if (paymentMethod === "razorpay") {
        query.paymentId = paymentId;
      }
      const result = await appointmentModel.create(query);
      return result as IAppointment;
    } catch (error) {
      throw error;
    }
  }
  async doctorWalletUpdate(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: number,
    type: string,
    reason: string
  ): Promise<boolean> {
    try {
      const result = await doctorWalletModal.findOneAndUpdate(
        { doctorId: new mongoose.Types.ObjectId(docId) },
        {
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
            },
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      if (result.__v == 0) {
        await doctorModel.updateOne(
          { _id: docId },
          { $set: { wallet: result._id } }
        );
      }
      if (result) return true;
      else return false;
    } catch (error) {
      throw error;
    }
  }
  async getAppointments(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    appointments?: IAppointment[];
    totalPages?: number;
  }> {
    try {
      const result = await appointmentModel.aggregate([
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
      const totalAppointments = await appointmentModel.countDocuments({
        userId,
      });
      if (result.length !== 0)
        return {
          status: true,
          appointments: result,
          totalPages: Math.ceil(totalAppointments / limit),
        };
      return { status: false };
    } catch (error) {
      throw error;
    }
  }
  async userWalletInfo(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    userWallet?: IUserWallet;
    totalPages?: number;
  }> {
    try {
      const result = await userWalletModal.aggregate([
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
    } catch (error) {
      throw error;
    }
  }
  async cancelAppointment(
    appointmentId: string,
    reason: string
  ): Promise<{ status: boolean; amount?: string; docId?: Types.ObjectId }> {
    try {
      const response = await appointmentModel.findOneAndUpdate(
        { _id: appointmentId },
        { status: "cancelled", reason, cancelledBy: "user" },
        { new: true }
      );
      if (response) {
        return { status: true, amount: response.amount, docId: response.docId };
      } else {
        return { status: false };
      }
    } catch (error) {
      throw error;
    }
  }
  async unbookSlot(
    docId: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<boolean> {
    try {
      const result = await doctorSlotsModel.updateOne(
        {
          doctorId: docId,
          date: date,
        },
        {
          $set: {
            "slots.$[slot].bookedBy": null,
            "slots.$[slot].availability": true,
            "slots.$[slot].locked": false,
            "slots.$[slot].lockedBy": null,
            "slots.$[slot].lockExpiration": null,
          },
        },
        {
          arrayFilters: [{ "slot.start": startTime }],
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async createCancelledAppointment(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    cancelledBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      try {
        const result = await cancelledAppointmentsModel.create({
          appointmentId: appointmentId,
          docId: docId,
          amount: amount,
          cancelledBy,
          reason,
        });
        if (result) return true;
        else return false;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  async userWalletUpdate(
    userId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: number,
    type: string,
    reason: string
  ): Promise<boolean> {
    try {
      try {
        const result = await userWalletModal.findOneAndUpdate(
          { userId: userId },
          {
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
              },
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
        if (result.__v == 0) {
          await userModel.updateOne(
            { _id: userId },
            { $set: { wallet: result._id } }
          );
        }
        if (result) return true;
        else return false;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  async getAppointment(appoinmentId: string): Promise<IAppointment | null> {
    try {
      const appointment = await appointmentModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(appoinmentId),
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
          $set: {
            medicalRecords: { $ifNull: ["$medicalRecords", []] },
          },
        },
        {
          $project: {
            _id: 0,
            date: 1,
            start: 1,
            end: 1,
            amount: 1,
            fees: 1,
            prescription: 1,
            createdAt: 1,
            docName: "$docInfo.name",
            docImage: "$docInfo.image",
            status: 1,
            docDegree: "$docInfo.degree",
            medicalRecords:1
          },
        },
      ]);
      return appointment[0] as IAppointment;
    } catch (error) {
      throw error;
    }
  }
  async addReview(
    appointmentId: string,
    userId: Types.ObjectId,
    docId: string,
    rating: number,
    description?: string
  ): Promise<boolean> {
    try {
      const result = await doctorModel.updateOne(
        { _id: docId },
        {
          $push: {
            reviews: {
              appointmentId,
              userId,
              rating,
              comment: description || "",
            },
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async fetchDoctorRating(
    id: string,
    page: number,
    limit: number
  ): Promise<{
    _id: Types.ObjectId;
    name: string;
    email: string;
    averageRating: number;
    totalReviews: number;
    latestReviews: Review[];
  }> {
    console.log("id", id, page, limit);
    const skipReviews = (page - 1) * limit;
    try {
      const result = await doctorModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
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
          $addFields: {
            averageRating: { $round: ["$averageRating", 1] },
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
    } catch (error) {
      throw error;
    }
  }
  async fetchFavoriteDoctors(id: Types.ObjectId): Promise<[Types.ObjectId]> {
    try {
      const result = await userModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $set: {
            favorites: { $ifNull: ["$favorites", []] },
          },
        },
      ]);
      return result[0].favorites;
    } catch (error) {
      throw error;
    }
  }
  async removeDoctorFavorites(
    userId: Types.ObjectId,
    docId: string
  ): Promise<boolean> {
    try {
      const result = await userModel.updateOne(
        { _id: userId },
        { $pull: { favorites: new mongoose.Types.ObjectId(docId) } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async addDoctorFavorites(
    userId: Types.ObjectId,
    docId: string
  ): Promise<boolean> {
    try {
      const result = await userModel.updateOne(
        { _id: userId },
        { $addToSet: { favorites: new mongoose.Types.ObjectId(docId) } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getFavoriteDoctorsList(
    userId: Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }> {
    try {
      const favoriteDoctors = await userModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $set: {
            favorites: {
              $ifNull: ["$favorites", []],
            },
          },
        },
        {
          $project: {
            _id: 0,
            favorites: 1,
          },
        },
      ]);
      const favorites = favoriteDoctors[0].favorites;
      if (favorites.length === 0) return { status: false };
      const doctors = await doctorModel.aggregate([
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
                $group: {
                  _id: "$_id",
                  name: { $first: "$name" },
                  image: { $first: "$image" },
                  degree: { $first: "$degree" },
                  fees: { $first: "$fees" },
                  averageRating: { $first: "$averageRating" },
                  totalReviews: { $first: "$totalReviews" },
                  department: { $push: "$departmentInfo.name" },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  department: 1,
                  image: 1,
                  degree: 1,
                  fees: 1,
                  averageRating: { $round: ["$averageRating", 1] },
                  totalReviews: 1,
                },
              },
              {
                $sort: {
                  _id: 1,
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
      return {
        status: true,
        doctors: doctors[0].data,
        totalPages: doctors[0].count,
      };
    } catch (error) {
      throw error;
    }
  }
  async addUserReviewToAppointment(
    appointmentId: string,
    rating: number,
    description?: string
  ): Promise<boolean> {
    try {
      const result = await appointmentModel.updateOne(
        { _id: appointmentId },
        {
          $set: {
            review: {
              rating: rating,
              description: description || "",
            },
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getMessages(
    id: string
  ): Promise<
    { sender: string; message: string; type: string; createdAt: Date }[]
  > {
    try {
      const result = await chatSchemaModel.findOne({ appointmentId: id });

      return result?.messages ?? [];
    } catch (error) {
      throw error;
    }
  }
  async medicalRecordUpload(appointmentId: string, files: string[]): Promise<boolean> {
      try{
        const result=await appointmentModel.updateOne({_id:new mongoose.Types.ObjectId(appointmentId)},{$set:{medicalRecords:files}})
        return result.modifiedCount>0

      }
      catch(error){
        throw error
      }
  }
}
export default UserRepository