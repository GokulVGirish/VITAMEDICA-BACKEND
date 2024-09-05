"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PayoutControllers {
    constructor(Interactor) {
        this.Interactor = Interactor;
    }
    async getRefundsList(req, res, next) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        try {
            const response = await this.Interactor.getRefundsList(page, limit, startDate, endDate);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, refundList: response.refundList, count: response.count });
            return res
                .status(404)
                .json({
                success: false,
                message: response.message
            });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getRefundDetail(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.Interactor.getRefundDetail(id);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, refundDetail: response.refundDetail });
            return res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getWithdrawalList(req, res, next) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        try {
            const response = await this.Interactor.getWithdrawalList(page, limit, startDate, endDate);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, withdrawalList: response.withdrawalList, count: response.count });
            return res.status(404).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = PayoutControllers;
