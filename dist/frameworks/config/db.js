"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB);
        mongoose_1.default.set("strictQuery", true);
        console.log("Connected to the MongoDB database");
    }
    catch (error) {
        console.error("Error connecting to the MongoDB database:", error);
        process.exit(1);
    }
};
exports.default = connectDB;
//enabling "strictQuery", you ensure that Mongoose validates queries against your schema definitions, providing stricter control over data integrity and schema adherence in your MongoDB database.
