import { Document } from "mongoose";



export interface RejectedDoctor extends Document{
    email:string,
    reason:string
}