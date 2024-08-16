import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../express/middlewares/jwt-verify";
import { CustomJwtPayload } from "../express/middlewares/jwt-verify";

export const connectedUsers:any=[]

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
        connectedUsers[userId?.toString()] = socket.id;
    }
    }
    socket.on("loggedin",(id)=>{
      connectedUsers[id]=socket.id
       console.log("connected users", connectedUsers);

    })
     console.log("connected users", connectedUsers);
      socket.on("clientDisconnected", (data) => {
        if(data){
           const decodedToken = verifyAccessToken(token);
           const { userId } = decodedToken as CustomJwtPayload;
           delete connectedUsers[userId.toString()]

        }
        
       
      });
   
  

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

  
  });

  return io
};
