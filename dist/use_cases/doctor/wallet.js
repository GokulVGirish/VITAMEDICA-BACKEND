"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorWalletInteractor {
    constructor(Repository) {
        this.Repository = Repository;
    }
    async getWalletDetails(page, limit, docId) {
        try {
            const response = await this.Repository.getWalletDetails(page, limit, docId);
            if (!response.status)
                return { status: false, message: "No wallet Found" };
            return {
                status: true,
                message: "Sucessful",
                doctorWallet: response.doctorWallet,
                totalPages: response.totalPages,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorWalletInteractor;
