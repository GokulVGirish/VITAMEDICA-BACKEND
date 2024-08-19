"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_verify_1 = require("../express/middlewares/jwt-verify");
const onlineUsers = {};
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log(`A new user has connected: ${socket.id}`);
        const token = socket.handshake.auth.token;
        console.log("out token", token);
        if (token) {
            const decodedToken = (0, jwt_verify_1.verifyAccessToken)(token);
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
            const doctorSocket = onlineUsers[data.from];
            io.to(doctorSocket).emit("check-online-status", { status: isOnline });
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
