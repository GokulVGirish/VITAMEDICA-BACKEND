import app from "./frameworks/express/app";
import connectDB from "./frameworks/config/db";

connectDB()

app.listen(process.env.PORT,()=>{
    console.log(`server listening and is ready to go ${process.env.PORT}`)
})