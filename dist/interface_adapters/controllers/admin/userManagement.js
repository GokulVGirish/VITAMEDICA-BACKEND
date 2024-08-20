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
}
exports.default = AdminUserManagementControllers;
