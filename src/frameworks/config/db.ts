import mongoose from "mongoose";
import { startLockCleaner } from "../background/lockCleaner";
import agenda from "../background/agenda";


const connectDB=async():Promise<void>=>{
  try{
     await mongoose.connect(process.env.MONGODB as string)
     mongoose.set("strictQuery", true);
     startLockCleaner()
     await agenda.start()
     console.log("Connected to the MongoDB database");

  }
  catch(error){
       console.error("Error connecting to the MongoDB database:", error);
       process.exit(1)

  }


}
export default connectDB
