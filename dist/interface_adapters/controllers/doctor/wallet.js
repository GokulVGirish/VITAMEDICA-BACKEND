"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorWalletControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getWalletDetails(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const docId = req.doctorData._id;
            const response = await this.interactor.getWalletDetails(page, limit, docId);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    walletDetail: response.doctorWallet,
                    totalPages: response.totalPages,
                });
            }
            else {
                res.status(404).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async withdrawFromWallet(req, res, next) {
        try {
            const docId = req.doctorData._id;
            const amount = req.params.amount;
            const response = await this.interactor.withdrawFromWallet(docId, amount);
            if (response)
                return res.status(200).json({ success: true, message: "Withdrawal Success" });
            return res.status(500).json({ success: false, message: "Try Again After Some Time" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = DoctorWalletControllers;
