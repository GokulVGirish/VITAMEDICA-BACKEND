

import { Types } from "mongoose";

interface ITransaction {
  appointment: Types.ObjectId;
  amount: number;
  date: Date;
  type: "credit" | "debit";
  reason: string;
  paymentMethod?: "razorpay";
}

interface IUserWallet {
  userId: Types.ObjectId;
  balance: number;
  transactionCount: number;
  transactions: ITransaction[];
}

export default IUserWallet;