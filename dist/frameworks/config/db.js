"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const lockCleaner_1 = require("../background/lockCleaner");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB);
        mongoose_1.default.set("strictQuery", true);
        (0, lockCleaner_1.startLockCleaner)();
        console.log("Connected to the MongoDB database");
    }
    catch (error) {
        console.error("Error connecting to the MongoDB database:", error);
        process.exit(1);
    }
};
exports.default = connectDB;
