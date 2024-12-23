import mongoose from "mongoose";
const DoctorwalletSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactionCount:{
    type:Number,
    default:0
  }

  ,
  transactions: [
    {
      appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
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
        enum: ["credit", "debit","withdraw"],
        required: true,
      },
      reason:{
        type:String,
        required:true

      },
    },
  ],
});

const  doctorWalletModal= mongoose.model("DoctorWallet", DoctorwalletSchema);
export default doctorWalletModal