import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import { MongoDoctor,OtpDoctor } from "../../entities/rules/doctor";
import doctorOtpModel from "../../frameworks/mongoose/models/TempDoctor";
import MongoDepartment from "../../entities/rules/departments";
import departmentModel from "../../frameworks/mongoose/models/departmentSchema";
import doctorModel from "../../frameworks/mongoose/models/DoctorSchema";
import mongoose, { mongo, Mongoose, Types } from "mongoose";
import { RejectedDoctor } from "../../entities/rules/rejectedDoctor";
import rejectedDoctorModel from "../../frameworks/mongoose/models/RejectedDoctor";
import { DoctorSlots } from "../../entities/rules/slotsType";
import doctorSlotsModel from "../../frameworks/mongoose/models/DoctorSlotsSchema";
import { IDoctorWallet } from "../../entities/rules/doctorWalletType";
import doctorWalletModal from "../../frameworks/mongoose/models/DoctorWalletSchema";
import IAppointment from "../../entities/rules/appointments";
import moment from "moment";
import appointmentModel from "../../frameworks/mongoose/models/AppointmentSchema";
import { Type } from "@aws-sdk/client-s3";
import cancelledAppointmentsModel from "../../frameworks/mongoose/models/cancelledAppointmentSchema";
import userWalletModal from "../../frameworks/mongoose/models/UserWalletSchema";
import userModel from "../../frameworks/mongoose/models/UserSchema";
import { getCurrentMonthDates, getCurrentWeekDates } from "../../frameworks/services/dates";
import { count } from "console";
import withdrawalModel from "../../frameworks/mongoose/models/WithdrawalSchema";
import { throwDeprecation } from "process";
import chatSchemaModel from "../../frameworks/mongoose/models/ChatSchema";

class DoctorRepository implements IDoctorRepository {
  async doctorExists(email: string): Promise<null | MongoDoctor> {
    try {
      const doctor = await doctorModel.findOne({ email: email });
      return doctor;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async tempOtpDoctor(data: OtpDoctor): Promise<{ userId: Types.ObjectId }> {
    try {
      const otpDoc = await doctorOtpModel.create(data);
      return { userId: otpDoc._id };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async createDoctorOtp(
    otp: string
  ): Promise<{ status: boolean; message: string; doctor?: MongoDoctor }> {
    try {
      const otpDoctor = await doctorOtpModel.findOne({ otp: otp });
      if (!otpDoctor) {
        return { status: false, message: "invalid otp" };
      }
      const now = new Date();
      const expirationTime = new Date(
        otpDoctor?.time.getTime() + 2 * 60 * 1000
      );
      if (expirationTime < now) {
        return { status: false, message: "expired otp" };
      }
      const doc = await doctorModel.create({
        name: otpDoctor.name,
        email: otpDoctor.email,
        password: otpDoctor.password,
        phone: otpDoctor.phone,
        gender: otpDoctor.gender,
        department: otpDoctor.department,
      });
      return { status: true, message: "created", doctor: doc };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getDoctor(email: string): Promise<MongoDoctor | null> {
    try {
      const doctor = await doctorModel.findOne({ email: email });
      return doctor;
    } catch (error) {
      console.log(error);
      throw error;
    }
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
      console.log(error);
      throw error;
    }
  }
  async documentsUpdate(
    docId: string,
    key1: string,
    key2: string,
    key3: string,
    key4: string
  ): Promise<void> {
    try {
      await doctorModel.updateOne(
        { _id: docId },
        {
          $set: {
            documents: {
              certificateImage: key1,
              qualificationImage: key2,
              aadarFrontImage: key3,
              aadarBackImage: key4,
            },
          },
        }
      );
      await doctorModel.updateOne(
        { _id: docId },
        {
          $set: {
            documentsUploaded: true,
          },
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async docStatusChange(id: string, status: string): Promise<void> {
    try {
      await doctorModel.updateOne({ _id: id }, { $set: { status: status } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async resendOtp(otp: string, email: string): Promise<boolean> {
    try {
      const otpDoc = await doctorOtpModel.findOne({ email: email });
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
  async resetPassword(email: string, password: string): Promise<boolean> {
    try {
      const result = await doctorModel.updateOne(
        { email: email },
        { $set: { password: password } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async updateProfileImage(
    id: Types.ObjectId,
    imagePath: string
  ): Promise<boolean> {
    try {
      const result = await doctorModel.updateOne(
        { _id: id },
        { $set: { image: imagePath } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async profileUpdate(
    id: Types.ObjectId,
    data: {
      name: string;
      phone: string;
      description: string;
      fees: string;
      degree: string;
      accountNumber: string;
      ifsc: string;
    }
  ): Promise<boolean> {
    try {
      console.log("data", data.accountNumber);
      const result = await doctorModel.updateOne(
        { _id: id },
        {
          $set: {
            name: data.name,
            phone: data.phone,
            description: data.description,
            fees: data.fees,
            degree: data.degree,
            complete: true,
            bankDetails: {
              accountNumber: data.accountNumber,
              ifsc: data.ifsc,
            },
          },
        }
      );
      if (result.modifiedCount > 0) return true;
      else return false;
    } catch (error) {
      throw error;
    }
  }
  async getRejectedDoctor(email: string): Promise<RejectedDoctor | null> {
    try {
      const result = await rejectedDoctorModel.findOne({ email: email });
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getSlot(date: Date, id: Types.ObjectId): Promise<DoctorSlots | null> {
    try {
      const result = await doctorSlotsModel.findOne({
        date: date,
        doctorId: id,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  async createSlot(id: Types.ObjectId, data: DoctorSlots): Promise<boolean> {
    try {
      const slot = await doctorSlotsModel.create({
        doctorId: id,
        date: data.date,
        slots: data.slots.map((slot) => ({ start: slot.start, end: slot.end })),
      });
      if (slot) return true;
      else return false;
    } catch (error) {
      throw error;
    }
  }
  async getWalletDetails(
    page: number,
    limit: number,
    docId: Types.ObjectId
  ): Promise<{
    status: boolean;
    doctorWallet?: IDoctorWallet;
    totalPages?: number;
  }> {
    try {
      const walletDetails = await doctorWalletModal.aggregate([
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
    } catch (error) {
      throw error;
    }
  }
  async getTodaysAppointments(
    docId: Types.ObjectId
  ): Promise<IAppointment[] | null> {
    try {
      const startOfDay = moment().startOf("day").toDate();
      const endOfDay = moment().endOf("day").toDate();
      const result = await appointmentModel.aggregate([
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
    } catch (error) {
      throw error;
    }
  }
  async getUpcommingAppointments(
    docId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{
    status: boolean;
    appointments?: IAppointment[];
    totalPages?: number;
  }> {
    try {
      const currentdate = new Date();
      const result = await appointmentModel.aggregate([
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
        const totalAppointments = await appointmentModel.countDocuments({
          docId: docId,
          date: { $gt: currentdate },
        });
        const totalPages = Math.ceil(totalAppointments / limit);
        return { status: true, appointments: result, totalPages };
      } else {
        return { status: false };
      }
    } catch (error) {
      throw error;
    }
  }
  async getAvailableDate(id: Types.ObjectId): Promise<DoctorSlots[] | null> {
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
  async getTimeSlots(
    id: Types.ObjectId,
    date: string
  ): Promise<DoctorSlots | null> {
    try {
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();
      const result = await doctorSlotsModel.findOne({
        doctorId: id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
  async deleteSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<boolean> {
    try {
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();
    
      const reault = await doctorSlotsModel.updateOne(
        { doctorId: id, date: { $gte: startOfDay, $lte: endOfDay } },
        { $pull: { slots: { start: startTime } } }
      );
      if (reault.modifiedCount > 0) return true;
      return false;
    } catch (error) {
      throw error;
    }
  }
  async cancelAppointment(
    id: Types.ObjectId,
    date: Date,
    startTime: Date,
    reason:string
  ): Promise<{
    status: boolean;
    amount?: string;
    id?: Types.ObjectId;
    userId?: Types.ObjectId;
  }> {
    const startOfDay = moment(date).startOf("day").toDate();
    const endOfDay = moment(date).endOf("day").toDate();
    try {
      const result = await appointmentModel.findOneAndUpdate(
        {
          $and: [
            { docId: id },
            { date: { $gte: startOfDay, $lte: endOfDay } },
            { start: startTime },
          ],
        },
        { status: "cancelled" ,reason,cancelledBy:"doctor"},
        {
          new: true,
        }
      );
      if (result) {
        return {
          status: true,
          amount: result.amount,
          id: result._id,
          userId: result.userId,
        };
      } else {
        return { status: false };
      }
    } catch (error) {
      throw error;
    }
  }
  async doctorWalletUpdate(
    docId: Types.ObjectId,
    amount: string,
    type: string,
    reason: string,
    appointmentId?: Types.ObjectId
  ): Promise<boolean> {
    const amountNum = Number(amount);
    try {
       const update = {
         $inc: {
           balance: type === "credit" ? amountNum : -amountNum,
           transactionCount: 1,
         },
         $push: {
           transactions: {
             amount: amountNum,
             type: type,
             reason: reason,
           },
         },
       };

       if (appointmentId) {
         (update.$push.transactions as any).appointment = appointmentId;
       }

       const result = await doctorWalletModal.findOneAndUpdate(
         { doctorId: docId },
         update,
         {
           new: true,
           upsert: true,
           setDefaultsOnInsert: true,
         }
       );
    return !!result
     
    } catch (error) {
      throw error;
    }
  }
  async withdrawalRecord(id: Types.ObjectId, amount: string): Promise<boolean> {
    const  numAmount=Number(amount)

      try{
        const result = await withdrawalModel.create({
          doctorId:id,
          amount: numAmount,
        });
        return !!result

      }
      catch(error){
        throw error
      }
  }
  async userWalletUpdate(
    userId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    type: string,
    reason: string,
  ): Promise<boolean> {
    const amountNum = Number(amount);
    try {
      const result = await userWalletModal.findOneAndUpdate(
        { userId },
        {
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
  }

  async createCancelledAppointment(
    docId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    cancelledBy: string,
    reason: string
  ): Promise<boolean> {
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
  }
  async getAppointmentDetail(id: string): Promise<IAppointment | null> {
    try {
      console.log("id", id);

      const result = await appointmentModel.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
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
          $set: {
            medicalRecords: { $ifNull: ["$medicalRecords", []] },
          },
        },
        {
          $project: {
            _id: 1,
            date: 1,
            start: 1,
            docId: 1,
            end: 1,
            review: 1,
            status: 1,
            userId: "$userInfo._id",
            userName: "$userInfo.name",
            dob: "$userInfo.dob",
            image: "$userInfo.image",
            city: "$userInfo.address.city",
            state: "$userInfo.address.state",
            prescription: 1,
            bloodGroup: "$userInfo.bloodGroup",
            medicalRecords:1
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async addPrescription(
    appointmentId: string,
    prescription: string
  ): Promise<boolean> {
    try {
      const result = await appointmentModel.updateOne(
        { _id: appointmentId },
        { $set: { prescription, status: "completed" } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getTodaysRevenue(id: Types.ObjectId): Promise<{
    revenue: number;
    count?: { appointmentsCount: number; cancellationsCount: number };
  }> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const result = await appointmentModel.aggregate([
        {
          $match: {
            docId: new mongoose.Types.ObjectId(id),
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $toDouble: "$fees" } },
            bookedCount: { $sum: 1 },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            revenue: 1,
            count: {
              appointmentsCount: "$bookedCount",
              cancellationsCount: "$cancelledCount",
            },
          },
        },
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getWeeklyReport(id: Types.ObjectId): Promise<{
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
  }> {
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();
      const result = await appointmentModel.aggregate([
        {
          $match: {
            docId: new mongoose.Types.ObjectId(id),
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        {
          $facet: {
            data: [
              {
                $addFields: {
                  dayOfWeek: { $dayOfWeek: "$createdAt" },
                },
              },
              {
                $group: {
                  _id: "$dayOfWeek",
                  totalRevenue: {
                    $sum: {
                      $toDouble: "$fees",
                    },
                  },
                },
              },
              {
                $sort: { _id: 1 },
              },
            ],
            count: [
              {
                $group: {
                  _id: null,
                  bookedCount: { $sum: 1 },
                  cancelledCount: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: "$count",
        },
        {
          $project: {
            revenue: "$data",
            count: {
              appointmentsCount: "$count.bookedCount",
              cancellationsCount: "$count.cancelledCount",
            },
          },
        },
      ]);
      console.log("result", result);
      const finalData = result[0];
      if (finalData) {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const formattedWeeklyRevenue = finalData?.revenue?.map((item: any) => ({
          label: dayNames[item._id - 1],
          totalRevenue: item.totalRevenue,
        }));
        finalData.revenue = formattedWeeklyRevenue;
      }
      return finalData as {
        count?: { appointmentsCount: number; cancellationsCount: number };
        revenue?: { label: string; totalRevenue: number }[];
      };
    } catch (error) {
      throw error;
    }
  }
  async getMonthlyReport(id: Types.ObjectId): Promise<{
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
  }> {
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
      const result = await appointmentModel.aggregate([
        {
          $match: {
            docId: new mongoose.Types.ObjectId(id),
            createdAt: {
              $gte: startOfYear,
              $lte: endOfYear,
            },
          },
        },
        {
          $facet: {
            data: [
              {
                $addFields: {
                  month: { $month: "$createdAt" },
                },
              },
              {
                $group: {
                  _id: "$month",
                  totalRevenue: {
                    $sum: { $toDouble: "$fees" },
                  },
                },
              },
              {
                $sort: { _id: 1 },
              },
            ],
            count: [
              {
                $group: {
                  _id: null,
                  bookedCount: { $sum: 1 },
                  cancelledCount: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: "$count",
        },
        {
          $project: {
            revenue: "$data",
            count: {
              appointmentsCount: "$count.bookedCount",
              cancellationsCount: "$count.cancelledCount",
            },
          },
        },
      ]);
      const finalData = result[0];
      if (finalData) {
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
        const formattedMonthlyRevenue = finalData?.revenue.map((item: any) => ({
          label: monthNames[item._id - 1],
          totalRevenue: item.totalRevenue,
        }));
        finalData.revenue = formattedMonthlyRevenue;
      }

      return finalData;
    } catch (error) {
      throw error;
    }
  }
  async getYearlyReport(id: Types.ObjectId): Promise<{
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: number; totalRevenue: number }[];
  }> {
    try {
      const result = await appointmentModel.aggregate([
        {
          $match: { docId: new mongoose.Types.ObjectId(id) },
        },
        {
          $facet: {
            data: [
              {
                $group: {
                  _id: { label: { $year: "$createdAt" } },
                  totalRevenue: { $sum: { $toDouble: "$fees" } },
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
                $sort: { label: 1 },
              },
            ],
            count: [
              {
                $group: {
                  _id: null,
                  bookedCount: { $sum: 1 },
                  cancelledCount: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: "$count",
        },
        {
          $project: {
            revenue: "$data",
            count: {
              appointmentsCount: "$count.bookedCount",
              cancellationsCount: "$count.cancelledCount",
            },
          },
        },
      ]);
   
      return result[0];
    } catch (error) {
      throw error;
    }
  }
  async getMessages(id: string): Promise<{ sender: string; message: string; type: string; createdAt: Date; }[]> {
      try{
        const result=await chatSchemaModel.findOne({appointmentId:id})
       
      return result?.messages ?? [];

      }
      catch(error){
        throw error
      }
  }
}
export default DoctorRepository