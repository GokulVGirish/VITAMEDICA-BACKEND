import { Types } from "mongoose";


export interface INotificationContent extends Document {
  content: string;
  type: "message" | "normal";
  appointmentId?: Types.ObjectId; 
  read: boolean;
  createdAt?: Date; 
  updatedAt?: Date; 
}