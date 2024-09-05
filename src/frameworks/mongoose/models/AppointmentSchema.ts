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
    paymentMethod:{
      type:String,
      enum:["razorpay","wallet"]

    },

    paymentStatus: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded", "anonymous"],
      default: "captured",
     
    },
    paymentId: {
      type: String,
      default:null
    },
     prescription: {
      type: String,
      default: null,
    
  },
  reason:{
    type:String,
    default:null
  },
  cancelledBy:{
    type:String,
    enum:["user","doctor"],
    required: false,
    default:null
  }

  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("Appointment", AppointmentSchema);
export default appointmentModel;
