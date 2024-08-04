"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RejectedDoctorSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: function () {
            return Date.now() + 3 * 24 * 60 * 60 * 1000;
        },
        index: { expires: '3d' }
    }
});
const rejectedDoctorModel = mongoose_1.default.model('rejectedDoctor', RejectedDoctorSchema);
exports.default = rejectedDoctorModel;
