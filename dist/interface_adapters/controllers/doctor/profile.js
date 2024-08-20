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
}
exports.default = DoctorProfileControllers;
