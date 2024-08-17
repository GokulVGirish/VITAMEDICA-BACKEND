import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../express/middlewares/jwt-verify";
import { CustomJwtPayload } from "../express/middlewares/jwt-verify";



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

    const token=socket.handshake.auth.token
    console.log("out token",token)
    if(token){
      const decodedToken=verifyAccessToken(token)
      const userId =(decodedToken as CustomJwtPayload)?.userId
    if(userId){
   
        socket.join(userId.toString())
    }
    }
    socket.on("loggedin",(id)=>{
    socket.join(id)

    })
    socket.on("join", (room) => {
      socket.join(room);
    });
      socket.on("calling", (message) => {
        const { room, data } = message;
        socket.to(room).emit("calling", data);
      });

      socket.on("ignoredStatus", (room) => {
        socket.to(room).emit("ignoredStatus");
      });

      socket.on("call-request", (data) => {
        console.log("callrequest received",data)
        const { from, room, to } = data;
        io.to(to).emit("call-request", data);
      });

      socket.on("cut-call", (a) => {
        io.to(a.from).emit("cut-call");
      });
    



   
  

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

  
  });

  return io
};
