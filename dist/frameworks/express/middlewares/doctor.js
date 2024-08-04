"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctor = void 0;
const DoctorSchema_1 = __importDefault(require("../../mongoose/models/DoctorSchema"));
const getDoctor = async (req, res, next) => {
    try {
        const { emailId } = req.user;
        const doctor = await DoctorSchema_1.default.findOne({ email: emailId });
        console.log("doctor", emailId);
        if (!doctor)
            return res.status(401).json({ message: "Un authorized access" });
        if (doctor.isBlocked)
            return res.status(401).json({ message: "Sorry User Blocked" });
        req.doctorData = doctor;
        next();
    }
    catch (error) {
    }
};
exports.getDoctor = getDoctor;
