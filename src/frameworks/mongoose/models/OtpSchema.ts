import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
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
  dob: {
    type: Date,
    required: true,
  },
  image: String,

  password: {
    type: String,
    required: true,
  },

  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  address: {
    street: String,
    city: String,
    State: String,
    zip: Number,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  otp: {
    type: String,
    required: true,
  },
});
const otpModel=mongoose.model("Otp",otpSchema)
export default otpModel