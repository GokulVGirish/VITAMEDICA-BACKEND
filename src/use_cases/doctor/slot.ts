import mongoose, { Types } from "mongoose";
import IDoctorSlotInteractor from "../../entities/iuse_cases/doctor/iSlot";
import { DoctorSlots, RangeDoctorSlots } from "../../entities/rules/slotsType";
import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import { cancelJob } from "../../frameworks/background/agenda";



class DoctorSlotsInteractor implements IDoctorSlotInteractor {
  constructor(
    private readonly Repository: IDoctorRepository,
  ) {}
  async addSlots(
    id: Types.ObjectId,
    data: RangeDoctorSlots
  ): Promise<{ status: boolean; message: string; errorCode?: string }> {
    try {
      const exist = await this.Repository.slotRangeExist(id,data.date.start,data.date.end);
      if (exist.length>0)
        return { status: false, message: "Slot For this Day Already exist",errorCode:"ALREADY_EXIST" };
      const response = await this.Repository.createSlot(id, data);
      if (!response) return { status: false, message: "Something Went Wrong" };
      return { status: true, message: "Slot Added Sucessfully" };
    } catch (error) {
     
      throw error;
    }
  }
  async getAvailableDate(
    id: Types.ObjectId
  ): Promise<{ status: boolean; message: string; dates?: string[] }> {
    try {
      const response = await this.Repository.getAvailableDate(id);
      if (!response) return { status: false, message: "no available slots" };
      const dates = [
        ...new Set(
          response.map((slot) => slot.date.toISOString().split("T")[0])
        ),
      ];
      return { status: true, message: "Success", dates: dates };
    } catch (error) {
      throw error;
    }
  }
  async getTimeSlots(
    id: Types.ObjectId,
    date: string
  ): Promise<{ status: boolean; message: string; slots?: DoctorSlots }> {
    try {
      const result = await this.Repository.getTimeSlots(id, date);

      if (!result) return { status: false, message: "Something went wrong" };
      return { status: true, message: "Success", slots: result };
    } catch (error) {
      throw error;
    }
  }
  async deleteUnbookedSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await this.Repository.deleteSlots(id, date, startTime);
      if (response) return { status: true, message: "Sucessfully Cancelled" };
      return { status: false, message: "Something Went wrong" };
    } catch (error) {
      throw error;
    }
  }
  async deleteBookedTimeSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date,
    reason: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const result = await this.Repository.cancelAppointment(
        id,
        date,
        startTime,
        reason
      );
      if (!result.status)
        return { status: false, message: "Something Went Wrong" };
      const res = await this.Repository.createCancelledAppointment(
        id,
        result.id as Types.ObjectId,
        result.amount as string,
        "doctor",
        reason
      );
      if (!res) return { status: false, message: "Something Went Wrong" };
      const response = await this.Repository.doctorWalletUpdate(
        id,
        result.amount as string,
        "debit",
        "appointment cancelled by Doc",
        result.id as Types.ObjectId
      );
      if (!response) return { status: false, message: "Something Went Wrong" };

      const userwaller = await this.Repository.userWalletUpdate(
        result.userId as Types.ObjectId,
        result.id as Types.ObjectId,
        result.amount as string,
        "credit",
        "Appointment cancelled by doctor",
      );
      if (!userwaller)
        return { status: false, message: "Something Went Wrong" };
      const deleteSlot = await this.Repository.deleteSlots(id, date, startTime);
      if (!deleteSlot)
        return { status: false, message: "Something Went Wrong" };
        await cancelJob(new mongoose.Types.ObjectId(result.id));

      return { status: true, message: "sucessfully done" };
    } catch (error) {
      throw error;
    }
  }
}
export default DoctorSlotsInteractor