import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export const connectedUsers:any={}

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`A new user has connected: ${socket.id}`);
    socket.on("register",(userId,role)=>{
        console.log("registered")
        connectedUsers[userId]={socketId:socket.id,role}
    })

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      for(let userId in connectedUsers){
        if(connectedUsers[userId].socketId===socket.id){
             delete connectedUsers[userId];
             break;
        }
      }
    });

  
  });

  return io
};
