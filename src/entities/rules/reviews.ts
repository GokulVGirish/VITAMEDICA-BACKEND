import { Types } from "mongoose";

export interface Review {
  appointmentId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface AllReviewsStats{
  
    _id: Types.ObjectId;
    name: string;
    email: string;
    averageRating: number;
    totalReviews: number;
    latestReviews: Review[];
  
}