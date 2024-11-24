"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (token, type) => {
    try {
        return jsonwebtoken_1.default.verify(token, type === "access"
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        console.log("token error", error);
        return null;
    }
};
exports.verifyToken = verifyToken;
const authMiddleware = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken)
        return res.status(401).json({ message: "No token provided" });
    const decodedAccessToken = (0, exports.verifyToken)(accessToken, "access");
    if (decodedAccessToken) {
        req.user = decodedAccessToken;
        return next();
    }
    const refreshToken = req.cookies.refreshToken;
    console.log("refreshToken", refreshToken);
    if (!refreshToken)
        return res.status(401).json({ message: "No token provided" });
    const decodedRefreshToken = (0, exports.verifyToken)(refreshToken, "refresh");
    if (decodedRefreshToken) {
        const { userId, email, verified, role } = decodedRefreshToken;
        const newAccessToken = jsonwebtoken_1.default.sign({ userId, email, verified, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        req.user = decodedRefreshToken;
        res.cookie("accessToken", newAccessToken, {
            path: "/",
            httpOnly: true,
            maxAge: 3600
        });
        return next();
    }
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(401).json({ message: "Session expired, please log in again" });
};
exports.default = authMiddleware;
