"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = exports.connectedUsers = void 0;
const socket_io_1 = require("socket.io");
const jwt_verify_1 = require("../express/middlewares/jwt-verify");
exports.connectedUsers = [];
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
                exports.connectedUsers[userId?.toString()] = socket.id;
            }
        }
        socket.on("loggedin", (id) => {
            exports.connectedUsers[id] = socket.id;
            console.log("connected users", exports.connectedUsers);
        });
        console.log("connected users", exports.connectedUsers);
        socket.on("clientDisconnected", (data) => {
            if (data) {
                const decodedToken = (0, jwt_verify_1.verifyAccessToken)(token);
                const { userId } = decodedToken;
                delete exports.connectedUsers[userId.toString()];
            }
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
