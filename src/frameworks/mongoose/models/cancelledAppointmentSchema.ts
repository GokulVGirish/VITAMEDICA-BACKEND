import mongoose from "mongoose";



const CancelledAppointmentsSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  docId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  cancelledBy:{
    type:String,
    enum:["user","doctor"],
    required:true
  },
  amount:{
    type:String,
    required:true
   },

   Date:{
    type:Date,
    default:Date.now
   }
 
});

const cancelledAppointmentsModel=mongoose.model("CancelledAppointment",CancelledAppointmentsSchema)
export default cancelledAppointmentsModel