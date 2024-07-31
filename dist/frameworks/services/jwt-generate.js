"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    constructor(jwtsecretkey, jwtrefreshkey) {
        this.jwtsecretkey = jwtsecretkey;
        this.jwtrefreshkey = jwtrefreshkey;
    }
    generateToken(payload, options) {
        return jsonwebtoken_1.default.sign(payload, this.jwtsecretkey, options);
    }
    generateRefreshToken(payload, options) {
        return jsonwebtoken_1.default.sign(payload, this.jwtrefreshkey, options);
    }
}
exports.default = JwtService;
