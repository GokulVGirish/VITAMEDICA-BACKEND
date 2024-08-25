import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import { MongoDoctor,OtpDoctor } from "../../entities/rules/doctor";
import doctorOtpModel from "../../frameworks/mongoose/models/TempDoctor";
import MongoDepartment from "../../entities/rules/departments";
import departmentModel from "../../frameworks/mongoose/models/departmentSchema";
import doctorModel from "../../frameworks/mongoose/models/DoctorSchema";
import { Types } from "mongoose";
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
    }
  ): Promise<boolean> {
    try {
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
      console.log("sewf", startOfDay, endOfDay, startTime);
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
    startTime: Date
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
        { status: "cancelled" },
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
    appointmentId: Types.ObjectId,
    amount: string,
    type: string,
    reason: string,
    paymentMethod: string
  ): Promise<boolean> {
    const amountNum = Number(amount);
    try {
      const result = await doctorWalletModal.findOneAndUpdate(
        { doctorId: docId },
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
              paymentMethod,
            },
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      if (result) return true;
      else return false;
    } catch (error) {
      throw error;
    }
  }
  async userWalletUpdate(
    userId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    amount: string,
    type: string,
    reason: string,
    paymentMethod: string
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
              paymentMethod,
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
  async getYearlyRevenue(id: Types.ObjectId): Promise<{ _id: number; totalRevenue: number; }[]> {
    
      try{
        const revenue = await doctorWalletModal.aggregate([
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
       return revenue
        

      }
      catch(error){
        throw error
      }
  }
  async getMonthlyRevenue(id: Types.ObjectId): Promise<{ month: string; totalRevenue: number; }[]> {
    const currentYear = new Date().getFullYear(); 

    try {
      const revenue = await doctorWalletModal.aggregate([
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
      return revenue

    } catch (error) {
      throw error;
    }
  }
  async getWeeklyAppointmentCount(id: Types.ObjectId): Promise<{ appointmentsCount: number; cancellationsCount: number } > {
      try{
          const { startOfWeek, endOfWeek } = getCurrentWeekDates();
          console.log(id)
          const result = await appointmentModel.aggregate([
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
              if (entry.status === "completed"||entry.status==="pending") {
               stats.appointmentsCount+=entry.count
              } else if (entry.status === "cancelled") {
                stats.cancellationsCount = entry.count;
              }
            });
            return stats

          
        


      }
      catch(error){
        throw error
      }
  }
  async getMonthlyAppointmentCount(id: Types.ObjectId): Promise<{ appointmentsCount: number; cancellationsCount: number; }> {
      try{
          const { startOfMonth, endOfMonth } = getCurrentMonthDates();
          const result = await appointmentModel.aggregate([
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
               } else if (entry.status === "cancelled") {
                 stats.cancellationsCount = entry.count;
               }
             });
            return stats;
        
        



      }
      catch(error){
        throw error
      }
  }

}
export default DoctorRepository