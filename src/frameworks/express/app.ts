import express from "express"
import dotenv from "dotenv"
import route from "./routes/routes"
import errorHandler from "./middlewares/error-handler"
import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()


const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
route(app)
app.use(errorHandler)









export default app