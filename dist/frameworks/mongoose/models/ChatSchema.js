"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: String,
        enum: ["user", "doctor"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["img", "txt"],
        default: "txt",
    },
}, {
    timestamps: true,
});
const ChatSchema = new mongoose_1.default.Schema({
    appointmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Appointment"
    },
    messages: [messageSchema]
});
const chatSchemaModel = mongoose_1.default.model("Chat", ChatSchema);
exports.default = chatSchemaModel;
