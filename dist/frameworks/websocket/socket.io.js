"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_verify_1 = require("../express/middlewares/jwt-verify");
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
                socket.join(userId.toString());
            }
        }
        socket.on("loggedin", (id) => {
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
        socket.on("cut-call", (a) => {
            io.to(a.from).emit("cut-call");
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
