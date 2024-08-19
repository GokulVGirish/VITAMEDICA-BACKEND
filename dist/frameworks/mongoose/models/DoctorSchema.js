"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ReviewSchema = new mongoose_1.Schema({
    appointmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        default: "",
    },
}, { _id: false, timestamps: true });
const documentSubSchema = new mongoose_1.Schema({
    certificateImage: {
        type: String,
        default: null,
    },
    qualificationImage: {
        type: String,
        default: null,
    },
    aadarFrontImage: {
        type: String,
        default: null,
    },
    aadarBackImage: {
        type: String,
        default: null,
    },
    yearsOfExperience: {
        type: Number,
        default: null,
    },
}, { _id: false });
const doctorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: null,
    },
    department: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    documentsUploaded: {
        type: Boolean,
        default: false,
    },
    documents: {
        type: documentSubSchema,
        default: null,
    },
    wallet: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "DoctorWallet",
        default: null,
    },
    degree: {
        type: String,
        default: null,
    },
    fees: {
        type: String,
        default: null,
    },
    complete: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["Submitted", "Pending", "Verified"],
        default: "Pending",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    reviews: [ReviewSchema]
});
const doctorModel = mongoose_1.default.model("Doctor", doctorSchema);
exports.default = doctorModel;
