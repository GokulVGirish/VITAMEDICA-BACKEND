import server from "./frameworks/express/app";
import connectDB from "./frameworks/config/db";

connectDB()

server.listen(process.env.PORT,()=>{
    console.log(`server listening and is ready to go ${process.env.PORT}`)
})