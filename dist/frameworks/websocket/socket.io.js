"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = exports.connectedUsers = void 0;
const socket_io_1 = require("socket.io");
exports.connectedUsers = {};
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
        socket.on("register", (userId, role) => {
            console.log("registered");
            exports.connectedUsers[userId] = { socketId: socket.id, role };
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            for (let userId in exports.connectedUsers) {
                if (exports.connectedUsers[userId].socketId === socket.id) {
                    delete exports.connectedUsers[userId];
                    break;
                }
            }
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
