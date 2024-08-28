"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorSearchBookingControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getDoctorList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;
            const response = await this.interactor.getDoctorsList(skip, limit);
            if (response.status)
                return res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    doctors: response.doctors,
                    totalPages: response.totalPages,
                });
            else
                res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getDoctorPage(req, res, next) {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 3;
            const response = await this.interactor.getDoctorPage(id, page, limit);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    doctor: response.doctor,
                    reviews: response.reviews
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
    async fetchMoreReviews(req, res, next) {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 3;
            const response = await this.interactor.fetchMoreReviews(id, page, limit);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    reviews: response.reviews,
                });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getAvailableDate(req, res, next) {
        try {
            const { doctorId } = req.params;
            const response = await this.interactor.getAvailableDate(doctorId);
            if (response.status) {
                res
                    .status(200)
                    .json({
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
        }
    }
    async getTimeSlots(req, res, next) {
        try {
            const date = req.query.date;
            const id = req.params.doctorId;
            const response = await this.interactor.getTimeSlots(id, date);
            if (response.status) {
                res
                    .status(200)
                    .json({
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
    async getDoctorsByDepartment(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;
            const category = req.query.category;
            console.log("category", category, page, limit);
            const response = await this.interactor.getDoctorsByCategory(category, skip, limit);
            if (response.status)
                return res.status(200).json({
                    success: true,
                    message: response.message,
                    doctors: response.doctors,
                    totalPages: response.totalPages,
                });
            else
                res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getDoctorBySearch(req, res, next) {
        try {
            const search = req.query.search;
            const response = await this.interactor.getDoctorBySearch(search);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, doctors: response.doctors });
            res.status(404).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = DoctorSearchBookingControllers;
