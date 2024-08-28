"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminAppointmentsControllers {
    constructor(Interactor) {
        this.Interactor = Interactor;
    }
    async fetchAppointmentList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const response = await this.Interactor.fetchAppointments(page, limit);
            if (response.success)
                return res.status(200).json({ success: true, message: response.message, data: response.data });
            return res.status(500).json({ success: false, message: "Something Went Wrong" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async fetchAppointmentDetail(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.Interactor.fetchAppointmentDetail(id);
            if (response.success)
                return res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            return res
                .status(500)
                .json({ success: false, message: "Something Went Wrong" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = AdminAppointmentsControllers;
