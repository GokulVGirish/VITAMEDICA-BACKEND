import { nextTick } from "process";
import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import { MongoAdmin } from "../../entities/rules/admin";
import MongoDepartment from "../../entities/rules/departments";
import { MongoDoctor } from "../../entities/rules/doctor";
import { MongoUser, User } from "../../entities/rules/user";
import adminModel from "../../frameworks/mongoose/models/AdminSchema";
import departmentModel from "../../frameworks/mongoose/models/departmentSchema";
import doctorModel from "../../frameworks/mongoose/models/DoctorSchema";
import userModel from "../../frameworks/mongoose/models/UserSchema";
import rejectedDoctorModel from "../../frameworks/mongoose/models/RejectedDoctor";
import {
  getCurrentMonthDates,
  getCurrentWeekDates,
} from "../../frameworks/services/dates";
import appointmentModel from "../../frameworks/mongoose/models/AppointmentSchema";
import IAppointment from "../../entities/rules/appointments";
import mongoose, { mongo } from "mongoose";
import { userInfo } from "os";
import cancelledAppointmentsModel from "../../frameworks/mongoose/models/cancelledAppointmentSchema";
import withdrawalModel from "../../frameworks/mongoose/models/WithdrawalSchema";

class AdminRepository implements IAdminRepository {
  async getAdmin(email: string): Promise<MongoAdmin | null> {
    const admin = await adminModel.findOne({ email: email });
    return admin;
  }
  async getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }> {
    try {
      const departments = await departmentModel.find();
      if (departments) {
        return { status: true, departments: departments };
      } else {
        return {
          status: false,
        };
      }
    } catch (error) {
      throw error;
    }
  }
  async addDepartment(
    name: string
  ): Promise<{ status: boolean; department?: MongoDepartment }> {
    try {
      const department = await departmentModel.create({ name: name });
      if (!department) {
        return { status: false };
      }
      return { status: true, department };
    } catch (error) {
      throw error;
    }
  }
  async deleteDepartment(
    id: string
  ): Promise<{ status: boolean; message?: string }> {
    try {
      const result = await departmentModel.deleteOne({ _id: id });
      if (result.deletedCount === 1) {
        return {
          status: true,
          message: "Department deleted successfully",
        };
      } else {
        return {
          status: false,
          message: "Department not found or could not be deleted",
        };
      }
    } catch (error) {
      throw error;
    }
  }
  async getUsers(): Promise<{
    status: boolean;
    message: string;
    users?: MongoUser[];
  }> {
    try {
      const users = await userModel.find();
      if (!users) {
        return { status: false, message: "error retriving users" };
      }
      return { status: true, message: "sucessful", users };
    } catch (error) {
      throw error;
    }
  }
  async blockUnblockUser(id: string, status: boolean): Promise<boolean> {
    try {
      const result = await userModel.updateOne(
        { _id: id },
        { $set: { isBlocked: status } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getUnverifiedDoctors(): Promise<{
    status: boolean;
    doctors?: MongoDoctor[];
  }> {
    try {
      const result = await doctorModel.aggregate([
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
            email: { $first: "$email" },
          },
        },
      ]);

      return { status: true, doctors: result };
    } catch (error) {
      throw error;
    }
  }
  async getDoctor(
    id: string
  ): Promise<{ status: boolean; doctor?: MongoDoctor }> {
    try {
      const result = await doctorModel
        .findOne({ _id: id })
        .populate("department");
      if (result) {
        return { status: true, doctor: result };
      } else {
        return { status: false };
      }
    } catch (error) {
      throw error;
    }
  }
  async verifyDoctor(id: string): Promise<boolean> {
    try {
      const result = await doctorModel.updateOne(
        { _id: id },
        { $set: { status: "Verified" } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }> {
    try {
      const doctors = await doctorModel.find({ status: "Verified" });
      if (doctors) {
        return { status: true, doctors: doctors };
      } else {
        return { status: false };
      }
    } catch (error) {
      throw error;
    }
  }
  async blockUnblockDoctor(id: string, status: boolean): Promise<boolean> {
    try {
      const result = await doctorModel.updateOne(
        { _id: id },
        { $set: { isBlocked: status } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async deleteDoctor(id: string): Promise<boolean> {
    try {
      const result = await doctorModel.deleteOne({ _id: id });
      return result.deletedCount === 1;
    } catch (error) {
      throw error;
    }
  }
  async createRejectedDoctor(email: string, reason: string): Promise<boolean> {
    try {
      const result = await rejectedDoctorModel.create({
        email: email,
        reason: reason,
      });
      return result ? true : false;
    } catch (error) {
      throw error;
    }
  }
  async getWeeklyRevenue(): Promise<{ label: string; totalRevenue: number }[]> {
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();

      const weeklyRevenue = await appointmentModel.aggregate([
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
    } catch (error) {
      throw error;
    }
  }

  async getWeeklyAppointmentCount(): Promise<{
    appointmentsCount: number;
    cancellationsCount: number;
  }> {
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();

      const result = await appointmentModel.aggregate([
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
            _id: null,
            bookedCount: { $sum: 1 },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            appointmentsCount: "$bookedCount",
            cancellationsCount: "$cancelledCount",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getMonthlyRevenue(): Promise<
    { label: string; totalRevenue: number }[]
  > {
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

      const monthlyRevenue = await appointmentModel.aggregate([
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
                $toDouble: "$amount",
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
    } catch (error) {
      throw error;
    }
  }
  async getMonthlyAppointmentCount(): Promise<{
    appointmentsCount: number;
    cancellationsCount: number;
  }> {
    try {
      const { startOfMonth, endOfMonth } = getCurrentMonthDates();
      const result = await appointmentModel.aggregate([
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
            _id: null,
            bookedCount: { $sum: 1 },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            appointmentsCount: "$bookedCount",
            cancellationsCount: "$cancelledCount",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getYearlyRevenue(): Promise<{ label: string; totalRevenue: number }[]> {
    try {
      const yearlyRevenue = await appointmentModel.aggregate([
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
                $toDouble: "$amount",
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
    } catch (error) {
      throw error;
    }
  }
  async getTodaysRevenue(): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const result = await appointmentModel.aggregate([
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
    } catch (error) {
      throw error;
    }
  }
  async getTodaysAppointmentCount(): Promise<{
    appointmentsCount: number;
    cancellationsCount: number;
  }> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const result = await appointmentModel.aggregate([
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
            bookedCount: { $sum: 1 },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            appointmentsCount: "$bookedCount",
            cancellationsCount: "$cancelledCount",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getUsersCount(): Promise<number> {
    try {
      const result = await userModel.countDocuments({});
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getDoctorCount(): Promise<{
    doctorCount: number;
    unverifiedDoctorCount: number;
  }> {
    try {
      const result = await doctorModel.aggregate([
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
    } catch (error) {
      throw error;
    }
  }
  async fetchAppointments(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<IAppointment[] | []> {
    try {
      const skip = (page - 1) * limit;
      let sortCondition: 1 | -1 = -1;
      let matchCondition: any = {};
      if (startDate && endDate) {
        matchCondition.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
        sortCondition = 1;
      }

      const result = await appointmentModel.aggregate([
        {
          $facet: {
            data: [
              {
                $match: matchCondition,
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
                $match: matchCondition,
              },
              {
                $count: "count",
              },
            ],
          },
        },
        {
          $unwind: "$totalCount",
        },
        {
          $project: {
            data: 1,
            totalCount: "$totalCount.count",
          },
        },
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }
  async fetchAppointmentDetail(id: string): Promise<IAppointment> {
    try {
      const result = await appointmentModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
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
          $unwind: "$departmentInfo",
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
            userImage: "$userInfo.image",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getDoctorProfile(
    id: string,
    page: number,
    limit: number
  ): Promise<MongoDoctor> {
    try {
      const skip = (page - 1) * limit;
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
              $slice: ["$reviews", skip, limit],
            },
            totalReviews: 1,
            averageRating: 1,
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getUserProfile(id: string): Promise<User | null> {
    try {
      const result = await userModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
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
            isBlocked: 1,
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getDoctorAppointments(
    id: string,
    page: number,
    limit: number
  ): Promise<IAppointment[] | null> {
    try {
      const skip = (page - 1) * limit;

      const result = await appointmentModel.aggregate([
        {
          $match: {
            docId: new mongoose.Types.ObjectId(id),
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
          $unwind: "$totalCount",
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getUserAppointments(
    id: string,
    page: number,
    limit: number
  ): Promise<IAppointment[]> {
    try {
      const skip = (page - 1) * limit;

      const result = await appointmentModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(id),
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
            totalCount: [{ $count: "count" }],
          },
        },
        {
          $unwind: "$totalCount",
        },
        {
          $project: {
            data: "$data",
            count: "$totalCount.count",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getTodaysRefunds(): Promise<{ total: number; count: number }> {
    try {
      const statOfDay = new Date();
      statOfDay.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const result = await cancelledAppointmentsModel.aggregate([
        {
          $match: {
            Date: {
              $gte: statOfDay,
              $lte: endOfToday,
            },
          },
        },
        {
          $addFields: {
            amountAsNumber: { $toDouble: "$amount" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountAsNumber" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getTodaysWithdrawals(): Promise<{ total: number; count: number }> {
    try {
      const statOfDay = new Date();
      statOfDay.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const result = await withdrawalModel.aggregate([
        {
          $match: {
            processedDate: {
              $gte: statOfDay,
              $lte: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getWeeklyRefunds(): Promise<{ total: number; count: number }> {
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();
      const result = await cancelledAppointmentsModel.aggregate([
        {
          $match: {
            Date: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        {
          $addFields: {
            amountAsNumber: { $toDouble: "$amount" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountAsNumber" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getWeeklyWithdrawals(): Promise<{ total: number; count: number }> {
    const { startOfWeek, endOfWeek } = getCurrentWeekDates();

    try {
      const result = await withdrawalModel.aggregate([
        {
          $match: {
            processedDate: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getMonthlyRefunds(): Promise<{ total: number; count: number }> {
    try {
      const { startOfMonth, endOfMonth } = getCurrentMonthDates();
      const result = await cancelledAppointmentsModel.aggregate([
        {
          $match: {
            Date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $addFields: {
            amountAsNumber: { $toDouble: "$amount" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountAsNumber" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getMonthlyWithdrawals(): Promise<{ total: number; count: number }> {
    const { startOfMonth, endOfMonth } = getCurrentMonthDates();
    try {
      const result = await withdrawalModel.aggregate([
        {
          $match: {
            processedDate: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getYearlyRefunds(): Promise<{ total: number; count: number }> {
    const currentYear = new Date().getFullYear();

    try {
      const result = await cancelledAppointmentsModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $year: "$Date" }, currentYear],
            },
          },
        },
        {
          $addFields: {
            amountAsNumber: { $toDouble: "$amount" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountAsNumber" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getYearlyWithdrawals(): Promise<{ total: number; count: number }> {
    try {
      const currentYear = new Date().getFullYear();
      const result = await withdrawalModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $year: "$processedDate" }, currentYear],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      const { total = 0, count = 0 } = result[0] || {};
      return { total, count };
    } catch (error) {
      throw error;
    }
  }
  async getRefundsList(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<{
    count: number;
    RefundList: {
      _id: mongoose.Types.ObjectId;
      date: Date;
      userName: string;
      cancelledBy: string;
      amount: string;
    }[];
  }> {
    try {
      const skip = (page - 1) * limit;
      let sortCondition: -1 | 1 = -1;
      let matchCondition: any = {};
      if (startDate && endDate) {
        const startDateStr = new Date(startDate).toISOString().split("T")[0];
        const endDateStr = new Date(endDate).toISOString().split("T")[0];

        matchCondition.$expr = {
          $and: [
            {
              $gte: [
                { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
                startDateStr,
              ],
            },
            {
              $lte: [
                { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
                endDateStr,
              ],
            },
          ],
        };

        sortCondition = 1;
      }

      const result = await cancelledAppointmentsModel.aggregate([
        {
          $match: matchCondition,
        },
        {
          $facet: {
            data: [
              {
                $sort: { Date: sortCondition },
              },
              {
                $lookup: {
                  from: "appointments",
                  localField: "appointmentId",
                  foreignField: "_id",
                  as: "appointmentInfo",
                },
              },
              {
                $unwind: "$appointmentInfo",
              },
              {
                $lookup: {
                  from: "users",
                  localField: "appointmentInfo.userId",
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
                  date: "$Date",
                  userName: "$userInfo.name",
                  cancelledBy: "$cancelledBy",
                  amount: 1,
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
            RefundList: "$data",
            count: "$count.count",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getWithdrawalList(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<{
    withdrawalList?: {
      name: string;
      date: Date;
      email: string;
      amount: number;
    }[];
    count?: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      let sortCondition: -1 | 1 = -1;
      let matchCondition: any = {};
      if (startDate && endDate) {
        const startDateStr = new Date(startDate).toISOString().split("T")[0];
        const endDateStr = new Date(endDate).toISOString().split("T")[0];

        matchCondition.$expr = {
          $and: [
            {
              $gte: [
                {
                  $dateToString: { format: "%Y-%m-%d", date: "$processedDate" },
                },
                startDateStr,
              ],
            },
            {
              $lte: [
                {
                  $dateToString: { format: "%Y-%m-%d", date: "$processedDate" },
                },
                endDateStr,
              ],
            },
          ],
        };

        sortCondition = 1;
      }

      const result = await withdrawalModel.aggregate([
        {
          $match: matchCondition,
        },
        {
          $facet: {
            data: [
              {
                $lookup: {
                  from: "doctors",
                  localField: "doctorId",
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
                  name: "$doctorInfo.name",
                  email: "$doctorInfo.email",
                  date: "$processedDate",
                  amount: 1,
                },
              },
              {
                $skip: skip,
              },
              {
                $limit: limit,
              },
            ],
            count: [{ $count: "count" }],
          },
        },
        {
          $unwind: "$count",
        },
        {
          $project: {
            withdrawalList: "$data",
            count: "$count.count",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getRefundDetail(
    id: string
  ): Promise<{
    _id: mongoose.Types.ObjectId;
    docName: string;
    userName: string;
    docImg: string;
    userImg: string;
    cancelledBy: string;
    appointmentTime: Date;
    appointmentBookedTime: Date;
    reason: string;
    amount: string;
    cancellationTime: Date;
  }> {
    try {
      const result = await cancelledAppointmentsModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
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
            from: "appointments",
            localField: "appointmentId",
            foreignField: "_id",
            as: "appointmentInfo",
          },
        },
        {
          $unwind: "$appointmentInfo",
        },
        {
          $lookup: {
            from: "users",
            localField: "appointmentInfo.userId",
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
            docName: "$doctorInfo.name",
            userName: "$userInfo.name",
            docImg: "$doctorInfo.image",
            userImg: "$userInfo.image",
            cancelledBy: 1,
            amount: 1,
            cancellationTime: "$Date",
            appointmentTime: "$appointmentInfo.date",
            appointmentBookedTime: "$appointmentInfo.createdAt",
            reason: 1,
            start: "$appointmentInfo.start",
            end: "$appointmentInfo.end",
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}
export default AdminRepository;
