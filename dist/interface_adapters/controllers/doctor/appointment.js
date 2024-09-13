"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorAppointmentControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async todaysAppointments(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const response = await this.interactor.getTodaysAppointments(docId);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    appointments: response.appointments,
                });
            }
            else {
                res.status(404).json({ status: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getUpcommingOrPrevAppointments(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 7;
            const docId = req.doctorData._id;
            const days = req.params.days;
            const response = await this.interactor.getUpcommingOrPrevAppointments(docId, page, limit, days);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    appointments: response.appointments,
                    totalPages: response.totalPages,
                });
            }
            else {
                res.status(404).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getAppointmentDetails(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.interactor.getAppointmentDetail(id);
            if (response.status) {
                return res.status(200).json({
                    success: true,
                    message: response.message,
                    detail: response.detail,
                    messages: response.messages,
                });
            }
            res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async addPrescription(req, res, nex) {
        try {
            const appointmentId = req.params.appointmentId;
            const response = await this.interactor.addPrescription(appointmentId, req.file);
            if (response.status)
                return res
                    .status(200)
                    .json({ success: true, message: response.message });
            return res
                .status(500)
                .json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            nex(error);
        }
    }
}
exports.default = DoctorAppointmentControllers;
