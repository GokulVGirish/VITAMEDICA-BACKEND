"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAppointmentControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async razorPayOrder(req, res, next) {
        try {
            console.log("inside");
            const body = req.body;
            const response = await this.interactor.razorPayOrderGenerate(body.amount, body.currency, body.receipt);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    order: response.order,
                });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async razorPayValidate(req, res, next) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, docId, slotDetails, fees, } = req.body;
            const userId = req.userData._id;
            const response = await this.interactor.razorPayValidateBook(razorpay_order_id, razorpay_payment_id, razorpay_signature, docId, slotDetails, userId, fees);
            console.log("response", response);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    appointment: response.appointment,
                });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
            throw error;
        }
    }
    async lockSlot(req, res, next) {
        try {
            const { doctorId, date, slotId } = req.body;
            console.log("docId", doctorId, "date", date, "slotId", slotId);
            const usertId = req.userData._id;
            const response = await this.interactor.lockSlot(usertId, doctorId, date, slotId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
            throw error;
        }
    }
    async getAppointments(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.userData._id;
            const response = await this.interactor.getAppointments(page, limit, userId);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    appointments: response.appointments,
                    totalPage: response.totalPages,
                });
            }
            else {
                res.status(404).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getAppointmentDetail(req, res, next) {
        try {
            const appointmentId = req.params.appointmentId;
            const response = await this.interactor.getAppointmentDetail(appointmentId);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, data: response.appointmentDetail });
            return res
                .status(500)
                .json({
                success: false,
                message: response.message,
            });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async cancelAppointment(req, res, next) {
        try {
            const userId = req.userData._id;
            const appointmentId = req.params.appointmentId;
            const date = new Date(req.query.date);
            const startTime = new Date(req.query.startTime);
            const reason = req.body.reason;
            console.log('reason of user', reason);
            const response = await this.interactor.cancelAppointment(userId, appointmentId, date, startTime, reason);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async addReview(req, res, next) {
        try {
            const { docId, rating, description } = req.body;
            const appointmentId = req.params.appointmentId;
            const userId = req.userData._id;
            console.log("docid", docId, "rating", rating, "description", description, "apppin", appointmentId, "userId", userId);
            const response = await this.interactor.addReview(appointmentId, userId, docId, rating, description);
            if (response.status)
                return res
                    .status(200)
                    .json({ success: true, message: response.message });
            return res
                .status(500)
                .json({ success: false, message: response.message });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserAppointmentControllers;
