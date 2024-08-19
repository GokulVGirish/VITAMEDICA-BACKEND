import mongoose, { Schema, Model, Document } from "mongoose";
import { MongoDoctor } from "../../../entities/rules/doctor"; 
import { Review } from "../../../entities/rules/doctor";
const ReviewSchema = new Schema<Review>(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required:true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { _id: false, timestamps: true }
);

const documentSubSchema = new Schema(
  {
    certificateImage: {
      type: String,
      default: null,
    },
    qualificationImage: {
      type: String,
      default: null,
    },
    aadarFrontImage: {
      type: String,
      default: null,
    },
    aadarBackImage: {
      type: String,
      default: null,
    },
    yearsOfExperience: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const doctorSchema = new Schema<MongoDoctor>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  documentsUploaded: {
    type: Boolean,
    default: false,
  },
  documents: {
    type: documentSubSchema,
    default: null,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DoctorWallet",
    default: null,
  },
  degree: {
    type: String,
    default: null,
  },
  fees: {
    type: String,
    default: null,
  },
  complete: {
    type: Boolean,
    default: false,
  },

  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["Submitted", "Pending", "Verified"],
    default: "Pending",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  reviews:[ReviewSchema]
});

const doctorModel = mongoose.model<MongoDoctor>("Doctor", doctorSchema);

export default doctorModel;
