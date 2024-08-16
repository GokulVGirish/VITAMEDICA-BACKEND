import IUserRepository from "../../entities/irepositories/iuserRepository";
import otpModel from "../../frameworks/mongoose/models/OtpSchema";
import { MongoUser, User } from "../../entities/rules/user";
import userModel from "../../frameworks/mongoose/models/UserSchema";
import { Types } from "mongoose";
import { MongoDoctor } from "../../entities/rules/doctor";
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

const moment = require("moment");


class UserRepository implements IUserRepository {
  async tempOtpUser(data: User): Promise<{userId:Types.ObjectId}> {
    try {
      const tempUser = await otpModel.create(data);
     return {userId:tempUser._id}
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
  async getDoctors(skip: number, limit: number): Promise<{doctors?:MongoDoctor[],totalPages?:number}> {
    try {
      const result = await doctorModel
        .find({ status: "Verified", complete: true }).skip(skip).limit(limit)
        .lean()
        .populate({ path: "department", select: "name" })
        .select("_id name department image degree fees");
        const totalDoctors = await doctorModel.countDocuments();
      return { doctors: result, totalPages: Math.ceil(totalDoctors / limit) };
    } catch (error) {
      throw error;
    }
  }
  async getDoctor(id: string): Promise<MongoDoctor | null> {
    try {
      const result = await doctorModel
        .findOne({ _id: id })
        .lean()
        .populate({ path: "department", select: "name" })
        .select("_id name department image degree fees description");
      return result;
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
    paymentId: string,
    fees: string
  ): Promise<IAppointment> {
    try {
      const result = await appointmentModel.create({
        docId: docId,
        userId: userId,
        date: date,
        start,
        end,
        amount,
        fees,
        paymentId,
      });
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
    reason: string,
    paymentMethod: string
  ): Promise<boolean> {
    try {
      const result = await doctorWalletModal.findOneAndUpdate(
        { doctorId: docId },
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
  async getAppointments(page: number, limit: number, userId: Types.ObjectId): Promise<{status:boolean;appointments?:IAppointment[],totalPages?:number}> {
      try{
        const result = await appointmentModel.aggregate([
          { $match: { userId: userId } },
          {$lookup:{
            from:"doctors",
            localField:"docId",
            foreignField:"_id",
            as:"doctorInfo"
          }
           },
           {
            $unwind:"$doctorInfo"
           },
           {
            $project:{
              _id:1,
              date:1,
              status:1,
              start:1,
              end:1,
              doctorName:"$doctorInfo.name",
              paymentStatus:1,
              amount:1,
              createdAt:1
            }
          },

           
          { $sort: { createdAt:-1 } },
          { $skip: (page - 1) * limit },
          {$limit:limit}
        ]);
        const totalAppointments=await appointmentModel.countDocuments({userId})
        if(result.length!==0)return {status:true,appointments:result, totalPages: Math.ceil(totalAppointments / limit)}
        return {status:false}

      }
      catch(error){
        throw error
      }
  }
  async userWalletInfo(page: number, limit: number, userId: Types.ObjectId): Promise<{ status: boolean; userWallet?: IUserWallet; totalPages?: number; }> {
      try{

        const result = await userWalletModal.aggregate([
          { $match: { userId } },
          {
            $project: {
              _id: 1,
              balance: 1,
              transactionCount: 1,
              transactions:{
                $slice:[
                  {$reverseArray:"$transactions"},
                  (page-1)*limit,
                  limit
                ]
              }
            }
          }
        ]);
         if (!result || result.length === 0) {
           return { status: false };
         }
         const totalPages = Math.ceil(
           result[0].transactionCount / limit
         );
         return {
           status: true,
           userWallet: result[0],
           totalPages: totalPages,
         };

      }
      catch(error){
        throw error
      }
  }
  async cancelAppointment(appointmentId: string): Promise<{ status: boolean; amount?: string; docId?: Types.ObjectId; }> {
      
    try{

      const response=await appointmentModel.findOneAndUpdate({_id:appointmentId},{status:"cancelled"},{new:true})
      if(response){
        return {status:true,amount:response.amount,docId:response.docId}
      }
      else{
        return {status:false}
      }

    }
    catch(error){
      throw error
    }
  }
  async unbookSlot(docId: Types.ObjectId, date: Date, startTime: Date): Promise<boolean> {
    try{
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
      return result.modifiedCount>0


    }
    catch(error){
      throw error
    }
      
  }
  async createCancelledAppointment(docId: Types.ObjectId, appointmentId: Types.ObjectId, amount: string, cancelledBy: string): Promise<boolean> {
      try{
          try {
            const result = await cancelledAppointmentsModel.create({
              appointmentId: appointmentId,
              docId: docId,
              amount: amount,
              cancelledBy,
            });
            if (result) return true;
            else return false;
          } catch (error) {
            throw error;
          }

      }
      catch(error){
        throw error
      }
  }
  async userWalletUpdate(userId: Types.ObjectId, appointmentId: Types.ObjectId, amount: number, type: string, reason: string, paymentMethod: string): Promise<boolean> {
      try{
        try {
          const result = await userWalletModal.findOneAndUpdate(
            {userId:userId },
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
      catch(error){
        throw error
      }
  }
  async getAppointment(appoinmentId: string): Promise<IAppointment | null> {
      try{
        return await appointmentModel.findOne({_id:appoinmentId})

      }
      catch(error){
        throw error
      }
  }
}
export default UserRepository