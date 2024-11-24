import Agenda from "agenda"
import appointmentModel from "../mongoose/models/AppointmentSchema";
import sendMail from "../services/sendEmail";
import mongoose, { Types } from "mongoose";
import {appointmentRemainder} from "../services/emailContent";
import moment from "moment";


const agenda = new Agenda({
  db: { address: process.env.MONGODB as string }, 
  processEvery: "30 seconds", 
});


agenda.define("send appointment notification", async (job:any) => {

  const { appointmentId, userId, docId } = job.attrs.data;

  
  const appointment = await appointmentModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(appointmentId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user", 
      },
    },
    {
      $lookup: {
        from: "doctors", 
        localField: "docId",
        foreignField: "_id",
        as: "doctor", 
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$doctor", 
    },
    {
      $project: {
        _id: 1,
        "user.name": 1,
        "user.email": 1,
        "doctor.name": 1,
        "doctor.email": 1,
        date: 1,
        start: 1,
        end: 1,
        status: 1,
      },
    },
  ]);

  if (!appointment || appointment.length === 0) {
    console.error(`Appointment ${appointmentId} not found!`);
    return;
  }

  const { user, doctor,date,start,end } = appointment[0];


 


 const formattedDate = moment(date).format("dddd, MMMM Do YYYY"); 
 const formattedTime = `${moment(start).format("h:mm A")} - ${moment(
   end
 ).format("h:mm A")}`; 


 await sendMail(
   doctor.email,
   appointmentRemainder(
     appointmentId,
     doctor.name,
     user.name,
     formattedDate,
     formattedTime,
     "doctor"
   ),
   "notification"
 );

 await sendMail(
   user.email,
   appointmentRemainder(
     appointmentId,
     user.name,
     doctor.name,
     formattedDate,
     formattedTime,
     "user"
   ),
   "notification"
 );
});
export async function cancelJob(appointmentId:Types.ObjectId) {
  await agenda.cancel({ "data.appointmentId": appointmentId });
  console.log(`Job with appointmentId ${appointmentId} has been cancelled.`);
}


export default agenda;

