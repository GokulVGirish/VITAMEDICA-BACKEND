"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DoctorwalletSchema = new mongoose_1.default.Schema({
    doctorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    transactions: [
        {
            appointment: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Appointment",
                required: true
            },
            amount: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            type: {
                type: String,
                enum: ["credit", "debit"],
                required: true,
            },
            reason: {
                type: String,
                required: true
            },
            paymentMethod: {
                type: String,
                enum: ["razorpay"],
            },
        },
    ],
});
const doctorWalletModal = mongoose_1.default.model("DoctorWallet", DoctorwalletSchema);
exports.default = doctorWalletModal;
