"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const authentication_1 = require("../express/middlewares/authentication");
const ChatSchema_1 = __importDefault(require("../mongoose/models/ChatSchema"));
const NotificationSchema_1 = __importDefault(require("../mongoose/models/NotificationSchema"));
const onlineUsers = {};
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
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
            const decodedToken = (0, authentication_1.verifyToken)(token, "access");
            const userId = decodedToken?.userId;
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
            console.log("message", data);
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
            const isOnline = onlineUsers[data.user];
            const doctorSocket = onlineUsers[data.from];
            io.to(doctorSocket).emit("check-online-status", { status: isOnline });
        });
        socket.on("join_appointment", ({ appointmentId }) => {
            socket.join(appointmentId);
        });
        socket.on("send_message", async ({ appointmentId, sender, message, type }) => {
            if (type === "txt") {
                await ChatSchema_1.default.updateOne({ appointmentId: appointmentId }, { $push: { messages: { sender, message, type } } }, { upsert: true });
            }
            io.to(appointmentId).emit("receive_message", { sender, message, type });
        });
        socket.on("send_notification", async ({ receiverId, content, appointmentId, type }) => {
            console.log("sendNotification received", receiverId, content, appointmentId, type);
            let notificationContent = {
                content,
                receiverId,
                type,
            };
            if (type === "message" || type === "appointment") {
                notificationContent.appointmentId = appointmentId;
            }
            const response = await NotificationSchema_1.default.updateOne({ receiverId: receiverId }, { $push: { notifications: notificationContent } }, { upsert: true, new: true });
            console.log("socket connection id", onlineUsers[receiverId]);
            io.to(onlineUsers[receiverId]).emit("receive_notification", {
                content: content,
                type: type,
            });
            io.to(onlineUsers[receiverId]).emit("realtime-notification", {
                receiverId,
                content,
                type,
                createdAt: new Date(),
            });
        });
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
exports.initializeSocket = initializeSocket;
