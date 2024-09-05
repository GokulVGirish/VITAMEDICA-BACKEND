"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminDashboardControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getCurrentDayReport(req, res, next) {
        try {
            const response = await this.interactor.getCurrentDayReport();
            if (response.success) {
                return res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    revenue: response.revenue,
                    count: response.count,
                    unverifiedDocs: response.unverifiedDocs,
                    doctors: response.doctors,
                    users: response.users,
                    refunds: response.todaysRefunds,
                    withdrawals: response.todaysWithdrawals
                });
            }
            return res
                .status(404)
                .json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getWeeklyReport(req, res, next) {
        try {
            const response = await this.interactor.getWeeklyReport();
            if (response.success) {
                return res.status(200).json({ success: true, message: response.message, revenue: response.revenue, count: response.count, refunds: response.refunds, withdrawals: response.withdrawals });
            }
            return res.status(404).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getMonthlyReport(req, res, next) {
        try {
            const response = await this.interactor.getMonthlyReport();
            if (response.success) {
                return res.status(200).json({
                    success: true,
                    message: response.message,
                    revenue: response.revenue,
                    count: response.count,
                    refunds: response.refunds,
                    withdrawals: response.withdrawals,
                });
            }
            return res
                .status(404)
                .json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getYearlyReport(req, res, nex) {
        try {
            const response = await this.interactor.getYearlyReport();
            console.log("rer", response.revenue);
            if (response.success) {
                return res.status(200).json({
                    success: true,
                    message: response.message,
                    revenue: response.revenue,
                    refunds: response.refunds,
                    withdrawals: response.withdrawals,
                });
            }
            return res
                .status(404)
                .json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = AdminDashboardControllers;
