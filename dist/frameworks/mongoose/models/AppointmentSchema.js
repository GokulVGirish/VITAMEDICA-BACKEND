"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AppointmentSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    docId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
    },
    fees: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "captured", "failed", "refunded", "anonymous"],
        default: "captured",
        //anonymous captured failed refunded pending
    },
    paymentId: {
        type: String,
    },
    prescription: {
        type: String,
        default: null,
    }
}, { timestamps: true });
const appointmentModel = mongoose_1.default.model("Appointment", AppointmentSchema);
exports.default = appointmentModel;
