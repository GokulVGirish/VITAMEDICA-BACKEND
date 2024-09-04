import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    fees: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    review:{
      rating:{
        type:Number
      },
      description:{
        type:String

      }

    },

    paymentStatus: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded", "anonymous"],
      default: "captured",
      //anonymous captured failed refunded pending
    },
    paymentId: {
      type: String,
    },
     prescription: {
      type: String,
      default: null,
    
  }
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("Appointment", AppointmentSchema);
export default appointmentModel;
