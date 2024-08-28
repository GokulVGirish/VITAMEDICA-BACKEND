"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorBookingInteractor {
    constructor(Repository, AwsS3) {
        this.Repository = Repository;
        this.AwsS3 = AwsS3;
    }
    async getDoctorsList(skip, limit) {
        try {
            const result = await this.Repository.getDoctors(skip, limit);
            if (result) {
                for (const doctor of result.doctors) {
                    if (doctor.image) {
                        const command = this.AwsS3.getObjectCommandS3(doctor.image);
                        const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                        doctor.image = url;
                    }
                }
                return {
                    status: true,
                    message: "Successfully fetched",
                    doctors: result.doctors,
                    totalPages: result.totalPages,
                };
            }
            return { status: false, message: "Something Went Wrong" };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorPage(id, page, limit) {
        try {
            const response = await this.Repository.getDoctor(id);
            if (!response)
                return { status: false, message: "something went wrong" };
            if (response.image) {
                const command = this.AwsS3.getObjectCommandS3(response.image);
                const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                response.image = url;
            }
            const result = await this.Repository.fetchDoctorRating(id, page, limit);
            return {
                status: true,
                message: "Sucessful",
                doctor: response,
                reviews: result,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async fetchMoreReviews(id, page, limit) {
        try {
            const result = await this.Repository.fetchDoctorRating(id, page, limit);
            return {
                status: true,
                message: "Sucessful",
                reviews: result,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getAvailableDate(id) {
        try {
            const result = await this.Repository.getSlots(id);
            if (!result)
                return { status: false, message: "no available slots" };
            const dates = [
                ...new Set(result.map((slot) => slot.date.toISOString().split("T")[0])),
            ];
            return { status: true, message: "Success", dates: dates };
        }
        catch (error) {
            throw error;
        }
    }
    async getTimeSlots(id, date) {
        try {
            const result = await this.Repository.getTimeSlots(id, date);
            if (!result)
                return { status: false, message: "Something went wrong" };
            return { status: true, message: "Success", slots: result };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorsByCategory(category, skip, limit) {
        try {
            const result = await this.Repository.getDoctorsByCategory(category, skip, limit);
            if (result) {
                for (const doctor of result.doctors) {
                    if (doctor.image) {
                        const command = this.AwsS3.getObjectCommandS3(doctor.image);
                        const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                        doctor.image = url;
                    }
                }
                return {
                    status: true,
                    message: "Successfully fetched",
                    doctors: result.doctors,
                    totalPages: result.totalPages,
                };
            }
            return { status: false, message: "Something Went Wrong" };
        }
        catch (error) {
            throw error;
        }
    }
    async getDoctorBySearch(searchKey) {
        try {
            const regex = new RegExp(searchKey, "i");
            const result = await this.Repository.getDoctorBySearch(regex);
            if (result) {
                for (const doctor of result) {
                    if (doctor.image) {
                        const command = this.AwsS3.getObjectCommandS3(doctor.image);
                        const url = await this.AwsS3.getSignedUrlS3(command, 3600);
                        doctor.image = url;
                    }
                }
                return {
                    status: true,
                    message: "Successfully fetched",
                    doctors: result,
                };
            }
            return { status: false, message: "Something Went Wrong" };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = DoctorBookingInteractor;
