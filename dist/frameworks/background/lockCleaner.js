"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLockCleaner = startLockCleaner;
const DoctorSlotsSchema_1 = __importDefault(require("../mongoose/models/DoctorSlotsSchema"));
async function releaseExpiredLocks() {
    const now = new Date();
    await DoctorSlotsSchema_1.default.updateMany({
        "slots.locked": true,
        "slots.lockExpiration": { $lt: now },
    }, {
        $set: {
            "slots.$[].locked": false,
            "slots.$[].lockedBy": null,
            "slots.$[].lockExpiration": null,
        },
    });
    console.log("Expired locks released.");
}
function startLockCleaner() {
    setInterval(releaseExpiredLocks, 60 * 1000);
}
