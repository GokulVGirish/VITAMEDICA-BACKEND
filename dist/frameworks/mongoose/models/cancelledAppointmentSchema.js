"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CancelledAppointmentsSchema = new mongoose_1.default.Schema({
    appointmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
    },
    docId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    cancelledBy: {
        type: String,
        enum: ["user", "doctor"],
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now
    }
});
const cancelledAppointmentsModel = mongoose_1.default.model("CancelledAppointment", CancelledAppointmentsSchema);
exports.default = cancelledAppointmentsModel;
