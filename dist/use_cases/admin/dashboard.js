"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminDashboardInteractor {
    constructor(repository) {
        this.repository = repository;
    }
    async getCurrentDayReport() {
        try {
            const revenue = await this.repository.getTodaysRevenue();
            const appointCount = await this.repository.getTodaysAppointmentCount();
            const unverifiedDoctors = await this.repository.getUnverifiedDoctorsCount();
            const users = await this.repository.getUsersCount();
            const doctors = await this.repository.getDoctorsCount();
            return {
                success: true,
                message: "success",
                revenue,
                count: appointCount,
                unverifiedDocs: unverifiedDoctors,
                doctors,
                users,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getWeeklyReport() {
        try {
            const revenue = await this.repository.getWeeklyRevenue();
            const appointCount = await this.repository.getWeeklyAppointmentCount();
            return {
                success: true,
                message: "success",
                revenue: revenue,
                count: appointCount,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getMonthlyReport() {
        try {
            const revenue = await this.repository.getMonthlyRevenue();
            const appointCount = await this.repository.getMonthlyAppointmentCount();
            return {
                success: true,
                message: "success",
                revenue: revenue,
                count: appointCount,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getYearlyReport() {
        try {
            const revenue = await this.repository.getYearlyRevenue();
            return {
                success: true,
                message: "success",
                revenue: revenue,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminDashboardInteractor;
