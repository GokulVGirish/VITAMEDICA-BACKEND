
import mongoose from "mongoose";
const UserwalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactionCount: {
    type: Number,
    default: 0,
  },

  transactions: [
    {
      appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
    },
  ],
});

const userWalletModal = mongoose.model("UserWallet", UserwalletSchema);
export default userWalletModal;