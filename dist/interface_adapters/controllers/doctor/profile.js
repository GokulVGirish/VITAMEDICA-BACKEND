"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorProfileControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getProfile(req, res, next) {
        try {
            req.doctorData.password = "**********";
            const response = await this.interactor.getProfile(req.doctorData.image);
            req.doctorData.image = response.url;
            res.status(200).json({
                success: true,
                doctorData: req.doctorData,
            });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async UpdateProfileImage(req, res, next) {
        try {
            console.log("here", req.file);
            const emailId = req.doctorData._id;
            const response = await this.interactor.updateProfileImage(emailId, req.file);
            console.log("sraae", response.status);
            if (response.status) {
                res.status(200).json({ success: true, imageData: response.imageData });
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
    async DoctorProfileUpdate(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const emailId = req.doctorData.email;
            const response = await this.interactor.profileUpdate(req.body, docId, emailId);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    data: response.data,
                    message: response.message,
                });
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
    async passwordResetLink(req, res, next) {
        try {
            const email = req.body.email;
            const response = await this.interactor.passwordResetLink(email);
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
    async resetPassword(req, res, next) {
        try {
            const token = req.params.token;
            const password = req.body.password;
            const response = await this.interactor.resetPassword(token, password);
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
    async fetchNotificationCount(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const response = await this.interactor.fetchNotificationCount(docId);
            res.status(200).json({ count: response });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async fetchNotifications(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const response = await this.interactor.fetchNotifications(docId);
            res.status(200).json({ notifications: response });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async markNotificationAsRead(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const response = await this.interactor.markNotificationAsRead(docId);
            if (response)
                return res.status(200).json({ success: true, message: "Success" });
            res
                .status(500)
                .json({ success: false, message: "Something went wrong" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = DoctorProfileControllers;
