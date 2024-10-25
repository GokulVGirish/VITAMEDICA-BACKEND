"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agenda_1 = __importDefault(require("agenda"));
const AppointmentSchema_1 = __importDefault(require("../mongoose/models/AppointmentSchema"));
const sendEmail_1 = __importDefault(require("../services/sendEmail"));
const mongoose_1 = __importDefault(require("mongoose"));
const emailContent_1 = require("../services/emailContent");
const moment_1 = __importDefault(require("moment"));
const agenda = new agenda_1.default({
    db: { address: process.env.MONGODB },
    processEvery: "30 seconds",
});
agenda.define("send appointment notification", async (job) => {
    const { appointmentId, userId, docId } = job.attrs.data;
    const appointment = await AppointmentSchema_1.default.aggregate([
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(appointmentId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $lookup: {
                from: "doctors",
                localField: "docId",
                foreignField: "_id",
                as: "doctor",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $unwind: "$doctor",
        },
        {
            $project: {
                _id: 1,
                "user.name": 1,
                "user.email": 1,
                "doctor.name": 1,
                "doctor.email": 1,
                date: 1,
                start: 1,
                end: 1,
                status: 1,
            },
        },
    ]);
    if (!appointment || appointment.length === 0) {
        console.error(`Appointment ${appointmentId} not found!`);
        return;
    }
    const { user, doctor, date, start, end } = appointment[0];
    const formattedDate = (0, moment_1.default)(date).format("dddd, MMMM Do YYYY");
    const formattedTime = `${(0, moment_1.default)(start).format("h:mm A")} - ${(0, moment_1.default)(end).format("h:mm A")}`;
    await (0, sendEmail_1.default)(doctor.email, (0, emailContent_1.appointmentRemainder)(appointmentId, doctor.name, user.name, formattedDate, formattedTime, "doctor"), "notification");
    await (0, sendEmail_1.default)(user.email, (0, emailContent_1.appointmentRemainder)(appointmentId, user.name, doctor.name, formattedDate, formattedTime, "user"), "notification");
});
exports.default = agenda;
