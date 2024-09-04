import mongoose from "mongoose";


const WithdrawalSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
 
  processedDate: {
    type: Date,
    default: Date.now,
  },
});

const withdrawalModel=mongoose.model("Withdrawal",WithdrawalSchema)
export default withdrawalModel