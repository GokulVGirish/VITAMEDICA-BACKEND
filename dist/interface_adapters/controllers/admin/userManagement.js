"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminUserManagementControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getUsers(req, res, next) {
        try {
            const response = await this.interactor.getUsers();
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    users: response.users,
                });
            }
            else {
                res.status(500).json({
                    success: true,
                    message: response.message,
                });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async blockUnblockUser(req, res, next) {
        try {
            const userId = req.params.id;
            const status = req.params.status;
            const response = await this.interactor.blockUnblockUser(userId, status);
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
    async getUserProfile(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.interactor.getUserProfile(id);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, user: response.data });
            return res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getUserAppointments(req, res, next) {
        try {
            const id = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            console.log("id", id, "page", page, "limit", limit);
            const response = await this.interactor.getUserAppointments(id, page, limit);
            if (response.message)
                return res.status(200).json({ success: true, message: response.message, data: response.data });
            return res.status(404).json({ success: false, message: response.message });
        }
        catch (error) {
            next(error);
            console.log(error);
        }
    }
}
exports.default = AdminUserManagementControllers;
