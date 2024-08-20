"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminAuthControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.interactor.adminLogin(email, password);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    adminAccessToken: response.adminAccessToken,
                    adminRefreshToken: response.adminRefreshToken,
                    message: "logged in sucessfully",
                });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    verifyToken(req, res, next) {
        try {
            res.status(200).json({ success: true, message: "token verified" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = AdminAuthControllers;
