"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminDoctorManagementControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getUnverifiedDoctors(req, res, next) {
        try {
            const response = await this.interactor.getUnverifiedDoctors();
            if (response.status) {
                res.status(200).json({ success: true, doctors: response.doctors });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getDoctorDocs(req, res, next) {
        try {
            const id = req.params.id;
            console.log("helloooo");
            const response = await this.interactor.getDoctorDocs(id);
            if (response.status) {
                res.status(200).json({ success: true, doctor: response.doctor });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async verifyDoctor(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.interactor.verifyDoctor(id);
            if (response) {
                res.status(200).json({ success: true });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDoctors(req, res, next) {
        try {
            const response = await this.interactor.getDoctors();
            if (response.status) {
                res.status(200).json({ success: true, doctors: response.doctors });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async doctorBlockUnblock(req, res, next) {
        try {
            const docId = req.params.id;
            const status = req.params.status;
            console.log("clicked");
            const response = await this.interactor.blockUnblockDoctor(docId, status);
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
    async rejectDoctor(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.query;
            const response = await this.interactor.rejectDoctor(id, reason);
            if (response.success) {
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
}
exports.default = AdminDoctorManagementControllers;
