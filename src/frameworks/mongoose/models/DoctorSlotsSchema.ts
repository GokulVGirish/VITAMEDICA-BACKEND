import mongoose, { Types } from "mongoose";

const DoctorSlotsSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
     
      type: Date,
      required: true,
    },
    slots: [
  
      {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          required: true, 
        },
        availability: {
          type: Boolean,
          default: true,
        },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps:true 
  }
);

const doctorSlotsModel = mongoose.model("DoctorSlot", DoctorSlotsSchema);
export default doctorSlotsModel;
