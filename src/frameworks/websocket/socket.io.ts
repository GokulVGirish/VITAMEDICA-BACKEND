import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../express/middlewares/jwt-verify";
import { CustomJwtPayload } from "../express/middlewares/jwt-verify";
import chatSchemaModel from "../mongoose/models/ChatSchema";
import { Socket } from "dgram";
import NotificationModel from "../mongoose/models/NotificationSchema";

const onlineUsers: any = {};
export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.cors_origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`A new user has connected: ${socket.id}`);
    const token = socket.handshake.auth.token;
    if (token) {
      const decodedToken = verifyAccessToken(token);
      const userId = (decodedToken as CustomJwtPayload)?.userId;
      if (userId) {
        onlineUsers[userId.toString()] = socket.id;
        socket.join(userId.toString());
      }
    }
    socket.on("loggedin", (id) => {
      console.log("loggedIn", id);
      onlineUsers[id] = socket.id;
      socket.join(id);
    });
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
      console.log("callrequest received", data);
      const { from, room, to } = data;
      io.to(to).emit("call-request", data);
    });

    socket.on("cut-call", (data) => {
      io.to(data.from).emit("cut-call");
    });
    socket.on("chat-message", (data) => {
      console.log("message",data)
      const { message, from, to } = data;
      io.to(to).emit("chat-message", data);
    });
    socket.on("review", (data) => {
      socket.to(data.to).emit("review");
    });
    socket.on("prescription", (data) => {
      console.log("heresss", data);
      socket.to(data.to).emit("prescription");
    });

    socket.on("check-online-status", (data) => {
      console.log("here", data);
      const isOnline = onlineUsers[data.user];
      const doctorSocket: string = onlineUsers[data.from];
      io.to(doctorSocket).emit("check-online-status", { status: isOnline });
    });

    socket.on("join_appointment", ({ appointmentId }) => {
      socket.join(appointmentId);
      console.log(`User joined appointment room///////: ${appointmentId}`);
    });

    socket.on(
      "send_message",
      async ({ appointmentId, sender, message, type }) => {
        if (type === "txt") {
          await chatSchemaModel.updateOne(
            { appointmentId: appointmentId },
            { $push: { messages: { sender, message, type } } },
            { upsert: true }
          );
        }

        io.to(appointmentId).emit("receive_message", { sender, message, type });
      }
    );

    socket.on(
      "send_notification",
      async({ receiverId, content, appointmentId, type }) => {
        console.log("sendNotification received",receiverId,content,appointmentId,type)
        const response=await NotificationModel.updateOne({receiverId:receiverId},{$push:{notifications:{content:content,type:type,appointmentId:appointmentId}}},{upsert:true,new:true})
        console.log("socket connection id", onlineUsers[receiverId]);
     
        io.to(onlineUsers[receiverId]).emit("receive_notification",{
          content:content
        })

      }
    );

    socket.on("logout", () => {
      console.log("hereee monu");

      for (let [userId, socketId] of Object.entries(onlineUsers)) {
        if (socketId === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      for (const [userId, socketId] of Object.entries(onlineUsers)) {
        if (socketId === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
    });
  });

  return io;
};
