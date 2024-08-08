import mongoose from "mongoose";
import { startLockCleaner } from "../background/lockCleaner";


const connectDB=async():Promise<void>=>{
  try{
     await mongoose.connect(process.env.MONGODB as string)
     mongoose.set("strictQuery", true);
     startLockCleaner()
     console.log("Connected to the MongoDB database");

  }
  catch(error){
       console.error("Error connecting to the MongoDB database:", error);
       process.exit(1)

  }


}
export default connectDB
//enabling "strictQuery", you ensure that Mongoose validates queries against your schema definitions, providing stricter control over data integrity and schema adherence in your MongoDB database.