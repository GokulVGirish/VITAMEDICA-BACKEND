

import { Document, ObjectId } from "mongoose";

interface ITransaction {
  appointment: ObjectId;
  amount: number;
  date?: Date;
  type: "credit" | "debit";
  reason: string;
  paymentMethod?: "razorpay";
}

export interface IDoctorWallet extends Document {
  doctorId: ObjectId;
  balance: number;
  transactions: ITransaction[];
}