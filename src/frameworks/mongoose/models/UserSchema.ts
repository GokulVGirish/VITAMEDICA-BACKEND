import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    postalCode: { type: Number, default: null },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema({
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
    default: null,
  },
  dob: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: null,
  },
  address: {
    type: addressSchema,
    default: null,
  },
  bloodGroup: {
    type: String,
    default: null,
  },
  register: {
    type: String,
    enum: ["Google", "Email"],
    default: "Email",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserWallet",
    default: null,
  },
});
const userModel=mongoose.model("User",userSchema)
export default userModel