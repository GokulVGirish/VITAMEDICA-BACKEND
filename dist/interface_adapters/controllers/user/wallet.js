"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserWalletControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getWalletInfo(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.userData._id;
            const response = await this.interactor.getWalletInfo(page, limit, userId);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    walletDetail: response.userWallet,
                    totalPages: response.totalPages,
                });
            }
            else {
                res.status(404).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserWalletControllers;
