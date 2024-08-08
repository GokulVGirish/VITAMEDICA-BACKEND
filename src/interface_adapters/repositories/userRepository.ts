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

const moment = require("moment");


class UserRepository implements IUserRepository {
  async tempOtpUser(data: User): Promise<{ status: true | false }> {
    try {
      const tempUser = await otpModel.create(data);
      if (tempUser) {
        return { status: true };
      } else {
        return { status: false };
      }
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
  async getDoctors(): Promise<MongoDoctor[] | null> {
    try {
      const result = await doctorModel
        .find({ status: "Verified", complete: true })
        .lean()
        .populate({ path: "department", select: "name" })
        .select("_id name department image degree fees");
      return result;
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
        doctorId: docId,
        date: { $gte: startOfDay, $lte: endOfDay },
        "slots._id": slotId, // Specific to slotId
        "slots.locked": true,
      });

      if (initialCheck) {
        console.log("Slot already locked:", initialCheck);
        return false;
      }

      const result = await doctorSlotsModel.findOneAndUpdate(
        {
          doctorId: docId,
          date: { $gte: startOfDay, $lte: endOfDay },
          "slots._id": slotId, // Specific to slotId
          "slots.availability": true,
          "slots.locked": false,
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
          "slots._id": slotId, // Specific to slotId
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
    fees: string,
    paymentId: string
  ): Promise<boolean> {
    try {
      const result = await appointmentModel.create({
        docId: docId,
        userId: userId,
        date: date,
        start,
        end,
        fees,
        paymentId,
      });
      if (result) return true;
      return false;
    } catch (error) {
      throw error;
    }
  }
}
export default UserRepository