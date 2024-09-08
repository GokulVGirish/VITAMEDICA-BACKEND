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
    review: {
        rating: {
            type: Number
        },
        description: {
            type: String
        }
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "wallet"]
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "captured", "failed", "refunded", "anonymous"],
        default: "captured",
    },
    paymentId: {
        type: String,
        default: null
    },
    prescription: {
        type: String,
        default: null,
    },
    reason: {
        type: String,
        default: null
    },
    cancelledBy: {
        type: String,
        enum: ["user", "doctor"],
        required: false,
        default: null
    },
    medicalRecords: [String]
}, { timestamps: true });
const appointmentModel = mongoose_1.default.model("Appointment", AppointmentSchema);
exports.default = appointmentModel;
