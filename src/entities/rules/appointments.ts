
import { Document, Types } from "mongoose";

interface IAppointment extends Document {
  userId: Types.ObjectId;
  docId: Types.ObjectId;
  date: Date;
  start: Date;
  end: Date;
  status: "pending" | "completed";
  fees: string;
  amount: string;
  paymentStatus: "pending" | "captured" | "failed" | "refunded" | "anonymous";
  paymentId?: string;
  createdAt?: Date;
  prescription?:string
}

export default IAppointment;