"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const agenda_1 = require("../../frameworks/background/agenda");
class DoctorSlotsInteractor {
    constructor(Repository) {
        this.Repository = Repository;
    }
    async addSlots(id, data) {
        try {
            const exist = await this.Repository.slotRangeExist(id, data.date.start, data.date.end);
            if (exist.length > 0)
                return { status: false, message: "Slot For this Day Already exist", errorCode: "ALREADY_EXIST" };
            const response = await this.Repository.createSlot(id, data);
            if (!response)
                return { status: false, message: "Something Went Wrong" };
            return { status: true, message: "Slot Added Sucessfully" };
        }
        catch (error) {
            throw error;
        }
    }
    async getAvailableDate(id) {
        try {
            const response = await this.Repository.getAvailableDate(id);
            if (!response)
                return { status: false, message: "no available slots" };
            const dates = [
                ...new Set(response.map((slot) => slot.date.toISOString().split("T")[0])),
            ];
            return { status: true, message: "Success", dates: dates };
        }
        catch (error) {
            throw error;
        }
    }
    async getTimeSlots(id, date) {
        try {
            const result = await this.Repository.getTimeSlots(id, date);
            if (!result)
                return { status: false, message: "Something went wrong" };
            return { status: true, message: "Success", slots: result };
        }
        catch (error) {
            throw error;
        }
    }
    async deleteUnbookedSlots(id, date, startTime) {
        try {
            const response = await this.Repository.deleteSlots(id, date, startTime);
            if (response)
                return { status: true, message: "Sucessfully Cancelled" };
            return { status: false, message: "Something Went wrong" };
        }
        catch (error) {
            throw error;
        }
    }
    async deleteBookedTimeSlots(id, date, startTime, reason) {
        try {
            const result = await this.Repository.cancelAppointment(id, date, startTime, reason);
            if (!result.status)
                return { status: false, message: "Something Went Wrong" };
            const res = await this.Repository.createCancelledAppointment(id, result.id, result.amount, "doctor", reason);
            if (!res)
                return { status: false, message: "Something Went Wrong" };
            const response = await this.Repository.doctorWalletUpdate(id, result.amount, "debit", "appointment cancelled by Doc", result.id);
            if (!response)
                return { status: false, message: "Something Went Wrong" };
            const userwaller = await this.Repository.userWalletUpdate(result.userId, result.id, result.amount, "credit", "Appointment cancelled by doctor");
            if (!userwaller)
                return { status: false, message: "Something Went Wrong" };
            const deleteSlot = await this.Repository.deleteSlots(id, date, startTime);
            if (!deleteSlot)
                return { status: false, message: "Something Went Wrong" };
            await (0, agenda_1.cancelJob)(new mongoose_1.default.Types.ObjectId(result.id));
            return { status: true, message: "sucessfully done" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorSlotsInteractor;
