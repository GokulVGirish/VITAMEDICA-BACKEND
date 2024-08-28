"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AdminAuthInteractor {
    constructor(repository, JwtServices) {
        this.repository = repository;
        this.JwtServices = JwtServices;
    }
    async adminLogin(email, password) {
        try {
            const adminExist = await this.repository.getAdmin(email);
            if (adminExist) {
                const hashedPassword = adminExist.password;
                const match = await bcryptjs_1.default.compare(password, hashedPassword);
                if (match) {
                    const adminAccessToken = this.JwtServices.generateToken({ emailId: adminExist.email, verified: true, role: "admin" }, { expiresIn: "1h" });
                    const adminRefreshToken = this.JwtServices.generateRefreshToken({ emailId: adminExist.email, verified: true, role: "admin" }, { expiresIn: "1d" });
                    return {
                        status: true,
                        adminAccessToken,
                        adminRefreshToken,
                        message: "logged in sucessfully",
                    };
                }
                else {
                    return { status: false, message: "incorrect password" };
                }
            }
            else {
                return {
                    status: false,
                    message: "Admin not found",
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = AdminAuthInteractor;
