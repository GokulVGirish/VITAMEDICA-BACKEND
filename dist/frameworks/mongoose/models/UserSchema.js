"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    postalCode: { type: Number, default: null },
}, {
    _id: false,
});
const userSchema = new mongoose_1.default.Schema({
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
        default: null,
    },
    dob: {
        type: Date,
        default: null,
    },
    image: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        default: null,
    },
    address: {
        type: addressSchema,
        default: null,
    },
    bloodGroup: {
        type: String,
        default: null,
    },
    register: {
        type: String,
        enum: ["Google", "Email"],
        default: "Email",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    favorites: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Doctor",
        },
    ],
    wallet: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "UserWallet",
        default: null,
    },
    isComplete: {
        type: Boolean,
        default: false
    }
});
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
