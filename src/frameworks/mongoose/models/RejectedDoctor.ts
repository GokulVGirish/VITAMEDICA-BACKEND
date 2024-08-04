import mongoose from "mongoose";


const RejectedDoctorSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            required:true
        },
        reason:{
            type:String,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now,
         },
        expiresAt: {
        type: Date,
        default: function() {
            return Date.now() + 3 * 24 * 60 * 60 * 1000; 
        },
        index: { expires: '3d' } 
       }
        
    }
)
const rejectedDoctorModel=mongoose.model('rejectedDoctor',RejectedDoctorSchema)
export default rejectedDoctorModel