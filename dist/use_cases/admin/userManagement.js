"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../../frameworks/express/app");
class AdminUserManagementInteractor {
    constructor(repository, AwsS3) {
        this.repository = repository;
        this.AwsS3 = AwsS3;
    }
    async getUsers() {
        try {
            const response = await this.repository.getUsers();
            if (response.status) {
                return {
                    status: true,
                    message: response.message,
                    users: response.users,
                };
            }
            else {
                return {
                    status: false,
                    message: response.message,
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async blockUnblockUser(id, status) {
        try {
            let changedStatus;
            if (status === "true") {
                changedStatus = false;
            }
            else {
                changedStatus = true;
            }
            const response = await this.repository.blockUnblockUser(id, changedStatus);
            if (!response) {
                return { status: false, message: "internal server error" };
            }
            if (changedStatus) {
                app_1.io.to(id).emit("blocked", "user");
            }
            return {
                status: true,
                message: `user has been sucessfully ${changedStatus ? "Blocked" : "Unblocked"}`,
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getUserProfile(id) {
        try {
            const result = await this.repository.getUserProfile(id);
            if (!result)
                return { status: false, message: "Couldnt fetch data" };
            if (result.image) {
                const command = this.AwsS3.getObjectCommandS3(result.image);
                const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                result.image = url;
            }
            return { status: true, message: "Success", data: result };
        }
        catch (error) {
            throw error;
        }
    }
    async getUserAppointments(id, page, limit) {
        try {
            const result = await this.repository.getUserAppointments(id, page, limit);
            if (result.length === 0)
                return { status: false, message: "Couldnt fetch data" };
            return { status: true, message: "Success", data: result };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminUserManagementInteractor;
