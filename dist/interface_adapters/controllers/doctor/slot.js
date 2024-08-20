"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorSlotsControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async addSlots(req, res, next) {
        try {
            const { _id } = req.doctorData;
            const response = await this.interactor.addSlots(_id, req.body);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getAvailableDates(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const response = await this.interactor.getAvailableDate(docId);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    dates: response.dates,
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: response.message,
                });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getTimeSlots(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const date = req.query.date;
            const response = await this.interactor.getTimeSlots(docId, date);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    slots: response.slots,
                });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async deleteUnbookedTimeSlots(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const date = new Date(req.query.date);
            const startTime = new Date(req.query.startTime);
            const response = await this.interactor.deleteUnbookedSlots(docId, date, startTime);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async deleteBookedTimeSlots(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const date = new Date(req.query.date);
            const startTime = new Date(req.query.startTime);
            const response = await this.interactor.deleteBookedTimeSlots(docId, date, startTime);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
            console.log("manhhhh");
        }
    }
}
exports.default = DoctorSlotsControllers;
