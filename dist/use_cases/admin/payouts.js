"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminPayoutsInteractor {
    constructor(Repository, AwsS3) {
        this.Repository = Repository;
        this.AwsS3 = AwsS3;
    }
    async getRefundsList(page, limit, startDate, endDate) {
        try {
            const response = await this.Repository.getRefundsList(page, limit, startDate, endDate);
            if (!response)
                return { status: false, message: "Couldnt Find Data" };
            if (response.RefundList.length > 0)
                return {
                    status: true,
                    message: "sucess",
                    refundList: response.RefundList,
                    count: response.count,
                };
            return { status: false, message: "Do Data Found" };
        }
        catch (error) {
            throw error;
        }
    }
    async getWithdrawalList(page, limit, startDate, endDate) {
        try {
            const response = await this.Repository.getWithdrawalList(page, limit, startDate, endDate);
            if (!response)
                return { status: false, message: "Couldnt fetch" };
            if (response.withdrawalList && response.withdrawalList?.length > 0)
                return {
                    status: true,
                    message: "Success",
                    withdrawalList: response.withdrawalList,
                    count: response.count,
                };
            return { status: false, message: "Couldnt fetch" };
        }
        catch (error) {
            throw error;
        }
    }
    async getRefundDetail(id) {
        try {
            const response = await this.Repository.getRefundDetail(id);
            if (response) {
                if (response.docImg) {
                    const command = this.AwsS3.getObjectCommandS3(response.docImg);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    response.docImg = url;
                }
                if (response.userImg) {
                    const command = this.AwsS3.getObjectCommandS3(response.userImg);
                    const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                    response.userImg = url;
                }
                return { status: true, message: "Success", refundDetail: response };
            }
            return { status: false, message: "Something went wrong" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = AdminPayoutsInteractor;
