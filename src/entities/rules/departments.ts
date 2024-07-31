import { Document } from "mongoose";

interface department {
    name:string

}
export default interface MongoDepartment extends department,Document{
    
}