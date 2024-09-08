import mongoose from "mongoose"
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "doctor"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["img", "txt"],
      default: "txt",
    },
  },
  {
    timestamps: true,
  }
);

const ChatSchema=new mongoose.Schema({

    appointmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Appointment"
    },

    messages:[messageSchema]

})

const chatSchemaModel=mongoose.model("Chat",ChatSchema)
export default chatSchemaModel
