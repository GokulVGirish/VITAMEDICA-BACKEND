"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DoctorSlotsSchema = new mongoose_1.default.Schema({
    doctorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    slots: [
        {
            start: {
                type: Date,
                required: true,
            },
            end: {
                type: Date,
                required: true,
            },
            availability: {
                type: Boolean,
                default: true,
            },
            locked: {
                type: Boolean,
                default: false,
            },
            lockedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            lockExpiration: {
                type: Date,
                default: null,
            },
            bookedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
        },
    ],
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});
const doctorSlotsModel = mongoose_1.default.model("DoctorSlot", DoctorSlotsSchema);
exports.default = doctorSlotsModel;
