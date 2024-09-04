
import mongoose from "mongoose";


const otpDoctorSchema = new mongoose.Schema({
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
    requied: true,
  },
  gender: {
    type: String,
    required: true,
  },
  department: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  }
],
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  time:{
    type:Date,
    default:Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});
const doctorOtpModel=mongoose.model("DoctorOtp",otpDoctorSchema)
export default doctorOtpModel