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

    paymentStatus: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded", "anonymous"],
      default: "captured",
      //anonymous captured failed refunded pending
    },
    paymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("Appointment", AppointmentSchema);
export default appointmentModel;
