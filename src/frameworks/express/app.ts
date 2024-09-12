import express from "express"
import http from "http"
import dotenv from "dotenv"
import route from "./routes/routes"
import errorHandler from "./middlewares/error-handler"
import cookieParser from "cookie-parser"
import cors from "cors"
import { initializeSocket } from "../websocket/socket.io"

dotenv.config()


const app=express()
const server=http.createServer(app)
export const io=initializeSocket(server)

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.cors_origin,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
route(app)
app.use(errorHandler)









export default server