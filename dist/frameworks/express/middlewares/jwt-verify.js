"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOCKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOCKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer")
        return res.status(401).json({ message: 'Invalid token type' });
    const decodedToken = verifyAccessToken(token);
    if (decodedToken) {
        req.user = decodedToken;
        return next();
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return res.status(401).json({ message: 'No refresh token provided' });
    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    if (decodedRefreshToken) {
        const { emailId, role, verified } = decodedRefreshToken;
        const newAccessToken = jsonwebtoken_1.default.sign({ emailId, role, verified }, process.env.ACCESS_TOCKEN_SECRET, { expiresIn: "1h" });
        req.user = decodedRefreshToken;
        res.cookie("accessToken", newAccessToken, {
            path: "/"
        });
        return next();
    }
    res.clearCookie("refreshToken");
    res.status(401).json({ message: 'Session expired, please log in again' });
};
exports.default = authMiddleware;
