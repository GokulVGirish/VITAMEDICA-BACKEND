import express from "express"
import http from "http"
import dotenv from "dotenv"
import route from "./routes/routes"
import errorHandler from "./middlewares/error-handler"
import cookieParser from "cookie-parser"
import cors from "cors"
import rateLimiter from "express-rate-limit"
import { initializeSocket } from "../websocket/socket.io"

dotenv.config()


const app=express()
const server=http.createServer(app)
export const io=initializeSocket(server)
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429, 
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders:true,
  legacyHeaders:false
});

app.use(limiter)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
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