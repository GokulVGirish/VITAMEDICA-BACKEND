import { Types } from "mongoose"
export interface Admin{
    email:string,
    password:string
}
export interface MongoAdmin extends Admin{
    _id:Types.ObjectId
}