import mongoose, { Schema, Model, Document } from "mongoose";
import { MongoDoctor } from "../../../entities/rules/doctor"; 
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
  status: {
    type: String,
    enum: ["Submitted", "Pending", "Verified"],
    default: "Pending",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const doctorModel = mongoose.model<MongoDoctor>("Doctor", doctorSchema);

export default doctorModel;
