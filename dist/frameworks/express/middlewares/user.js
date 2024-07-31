"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const UserSchema_1 = __importDefault(require("../../mongoose/models/UserSchema"));
const getUser = async (req, res, next) => {
    try {
        const { emailId } = req.user;
        const user = await UserSchema_1.default.findOne({ email: emailId });
        if (!user)
            return res.status(401).json({ message: "Un authorized access" });
        if (user.isBlocked)
            return res.status(401).json({ message: "Sorry User Blocked" });
        req.userData = user;
        next();
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server Error" });
    }
};
exports.getUser = getUser;
