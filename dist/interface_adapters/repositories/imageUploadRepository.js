"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChatSchema_1 = __importDefault(require("../../frameworks/mongoose/models/ChatSchema"));
class ImageUploadRepository {
    async imageAsMessageUpdate(appointmentId, sender, filePath) {
        try {
            const result = await ChatSchema_1.default.updateOne({ appointmentId: appointmentId }, { $push: { messages: { sender, message: filePath, type: "img" } } }, { upsert: true });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = ImageUploadRepository;
