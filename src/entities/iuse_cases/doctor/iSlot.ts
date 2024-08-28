import { Types } from "mongoose";
import { DoctorSlots } from "../../rules/slotsType";


interface IDoctorSlotInteractor {
  addSlots(
    id: Types.ObjectId,
    data: DoctorSlots
  ): Promise<{ status: boolean; message: string; errorCode?: string }>;
  getAvailableDate(
    id: Types.ObjectId
  ): Promise<{ status: boolean; message: string; dates?: string[] }>;
  getTimeSlots(
    id: Types.ObjectId,
    date: string
  ): Promise<{ status: boolean; message: string; slots?: DoctorSlots }>;
  deleteUnbookedSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date
  ): Promise<{ status: boolean; message: string }>;
  deleteBookedTimeSlots(
    id: Types.ObjectId,
    date: Date,
    startTime: Date,
    reason: string
  ): Promise<{ status: boolean; message: string }>;
}
export default IDoctorSlotInteractor