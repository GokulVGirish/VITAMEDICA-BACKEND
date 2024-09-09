"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationContentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["message", "normal"],
        required: true,
    },
    appointmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Appointment",
        required: false
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const NotificationSchema = new mongoose_1.default.Schema({
    receiverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    notifications: [NotificationContentSchema],
});
const NotificationModel = mongoose_1.default.model("Notification", NotificationSchema);
exports.default = NotificationModel;
