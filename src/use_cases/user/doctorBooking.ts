import { GetObjectCommand } from "@aws-sdk/client-s3";
import IUserRepository from "../../entities/irepositories/iuserRepository";
import IDoctorBookingInteractor from "../../entities/iuse_cases/user/iDoctorBooking";
import { MongoDoctor } from "../../entities/rules/doctor";
import { IawsS3 } from "../../entities/services/awsS3";
import { Types } from "mongoose";
import { Review } from "../../entities/rules/doctor";
import { DoctorSlots } from "../../entities/rules/slotsType";


class DoctorBookingInteractor implements IDoctorBookingInteractor {
  constructor(
    private readonly Repository: IUserRepository,
    private readonly AwsS3: IawsS3
  ) {}

  async getDoctorsList(
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }> {
    try {
      const result = await this.Repository.getDoctors(skip, limit);

      if (result) {
        for (const doctor of result.doctors as MongoDoctor[]) {
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
    } catch (error) {
      throw error;
    }
  }
  async getDoctorPage(
    id: string,
    page: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    doctor?: MongoDoctor;
    reviews?: {
      _id: Types.ObjectId;
      name: string;
      email: string;
      averageRating: number;
      totalReviews: number;
      latestReviews: Review[];
    };
  }> {
    try {
      const response = await this.Repository.getDoctor(id);
      if (!response) return { status: false, message: "something went wrong" };
      if (response.image) {
        const command = this.AwsS3.getObjectCommandS3(response.image as string);
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
    } catch (error) {
      throw error;
    }
  }
  async fetchMoreReviews(
    id: string,
    page: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    reviews?: {
      _id: Types.ObjectId;
      name: string;
      email: string;
      averageRating: number;
      totalReviews: number;
      latestReviews: Review[];
    };
  }> {
    try {
      const result = await this.Repository.fetchDoctorRating(id, page, limit);
      return {
        status: true,
        message: "Sucessful",
        reviews: result,
      };
    } catch (error) {
      throw error;
    }
  }
  async getAvailableDate(
    id: string
  ): Promise<{ status: boolean; message: string; dates?: string[] }> {
    try {
      const result = await this.Repository.getSlots(id);
      if (!result) return { status: false, message: "no available slots" };
      const dates = [
        ...new Set(result.map((slot) => slot.date.toISOString().split("T")[0])),
      ];
      return { status: true, message: "Success", dates: dates };
    } catch (error) {
      throw error;
    }
  }
  async getTimeSlots(
    id: string,
    date: string
  ): Promise<{ status: boolean; message: string; slots?: DoctorSlots }> {
    try {
      const result = await this.Repository.getTimeSlots(id, date);

      if (!result) return { status: false, message: "Something went wrong" };
      return { status: true, message: "Success", slots: result };
    } catch (error) {
      throw error;
    }
  }

  async getDoctorsByCategory(
    category: string,
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }> {
    try {
      const result = await this.Repository.getDoctorsByCategory(
        category,
        skip,
        limit
      );
      if (result) {
        for (const doctor of result.doctors as MongoDoctor[]) {
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
    } catch (error) {
      throw error;
    }
  }
  async getDoctorBySearch(
    searchKey: string
  ): Promise<{ status: boolean; message: string; doctors?: MongoDoctor[] }> {
    try {
      const regex = new RegExp(searchKey, "i");
      const result = await this.Repository.getDoctorBySearch(regex);
      if (result) {
        for (const doctor of result as MongoDoctor[]) {
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
    } catch (error) {
      throw error;
    }
  }
  async fetchFavoriteDoctors(
    id: Types.ObjectId
  ): Promise<{
    success: boolean;
    message: string;
    favorites?: [Types.ObjectId];
  }> {
    try {
      const result = await this.Repository.fetchFavoriteDoctors(id);
      if (result)
        return { success: true, message: "Fetch success", favorites: result };
      return { success: false, message: "Failed to find" };
    } catch (error) {
      throw error;
    }
  }
  async removeDoctorFavorites(
    userId: Types.ObjectId,
    docId: string
  ): Promise<boolean> {
    try {
      const response = await this.Repository.removeDoctorFavorites(userId,docId);
      return response
    } catch (error) {
      throw error;
    }
  }
  async addDoctorFavorites(userId: Types.ObjectId, docId: string): Promise<boolean> {
      try{
        const response=await this.Repository.addDoctorFavorites(userId,docId)
        return response

      }
      catch(error){
        throw error
      }
  }
  async getFavoriteDoctorsList(userId: Types.ObjectId, skip: number, limit: number): Promise<{ status: boolean; message: string; errorCode?: string; doctors?: MongoDoctor[]; totalPages?: number; }> {
      try{
        const result=await this.Repository.getFavoriteDoctorsList(userId,skip,limit)
        if(result.status){

          for(let doctor of result.doctors!){
            if("image" in doctor && doctor.image){
              const command=this.AwsS3.getObjectCommandS3(doctor.image)
              const url=await this.AwsS3.getSignedUrlS3(command,3600)
              doctor.image=url
            }

          }
           return {
             status: true,
             message: "Success",
             doctors: result.doctors,
             totalPages: result.totalPages,
           };
        }
        return {status:false,message:"No favorite doctors"}

      }
      catch(error){
        throw error
      }
  }
}
export default DoctorBookingInteractor