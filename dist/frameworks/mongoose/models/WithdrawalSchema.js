"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const WithdrawalSchema = new mongoose_1.default.Schema({
    doctorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    processedDate: {
        type: Date,
        default: Date.now,
    },
});
const withdrawalModel = mongoose_1.default.model("Withdrawal", WithdrawalSchema);
exports.default = withdrawalModel;
