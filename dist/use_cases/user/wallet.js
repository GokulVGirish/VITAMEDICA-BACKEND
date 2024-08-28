"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserWalletInteractor {
    constructor(Repository) {
        this.Repository = Repository;
    }
    async getWalletInfo(page, limit, userId) {
        try {
            const response = await this.Repository.userWalletInfo(page, limit, userId);
            if (!response.status)
                return { status: false, message: "No wallet Found" };
            return {
                status: true,
                message: "Sucessful",
                userWallet: response.userWallet,
                totalPages: response.totalPages,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = UserWalletInteractor;
