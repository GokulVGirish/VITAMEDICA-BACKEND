import { Types } from "mongoose";
import { MongoDoctor } from "../../rules/doctor";
import { Review } from "../../rules/doctor";
import { DoctorSlots } from "../../rules/slotsType";


interface IDoctorBookingInteractor {
  getDoctorsList(
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }>;
  getDoctorPage(
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
  }>;

  fetchMoreReviews(
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
  }>;
  getAvailableDate(
    id: string
  ): Promise<{ status: boolean; message: string; dates?: string[] }>;
  getTimeSlots(
    id: string,
    date: string
  ): Promise<{ status: boolean; message: string; slots?: DoctorSlots }>;
  getDoctorsByCategory(
    category: string,
    skip: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    doctors?: MongoDoctor[];
    totalPages?: number;
  }>;
  getDoctorBySearch(
    searchKey: string
  ): Promise<{ status: boolean; message: string; doctors?: MongoDoctor[] }>;
}
export default IDoctorBookingInteractor