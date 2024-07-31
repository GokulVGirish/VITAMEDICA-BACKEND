"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserController {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async otpSignup(req, res, next) {
        try {
            const body = req.body;
            const response = await this.interactor.otpSignup(body);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    token: response.token,
                });
            }
            else {
                res.status(200).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log("otpsignup", error);
            next(error);
        }
    }
    async verifyOtpSignup(req, res, next) {
        try {
            const { otp } = req.body;
            const response = await this.interactor.verifyOtpSignup(otp);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: "signed Up Sucessfully",
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                });
            }
            else {
                res
                    .status(400)
                    .json({ success: false, message: "invalid otp Entered" });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async verifyToken(req, res, next) {
        try {
            res.status(200).json({ success: true, message: "token verified" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.interactor.login(email, password);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: "logged in Sucessfully",
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
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
    async googleSignup(req, res, next) {
        try {
            const { email, name, sub } = req.body;
            const response = await this.interactor.googleSignup(email, name, sub);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                });
            }
            else {
                switch (response.errorCode) {
                    case "USER_EXIST":
                        res.status(409).json({ status: false, message: response.message });
                        break;
                    case "SERVER_ERROR":
                        res.status(500).json({ status: false, message: response.message });
                        break;
                    default:
                        res.status(400).json({ success: false, message: response.message });
                        break;
                }
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async googleLogin(req, res, next) {
        try {
            const { email, sub } = req.body;
            console.log(req.body);
            const response = await this.interactor.googleLogin(email, sub);
            if (response.status) {
                res.status(200).json({
                    success: true,
                    message: "logged in Sucessfully",
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                });
            }
            else {
                switch (response.errorCode) {
                    case "NO_USER":
                        return res.status(404).json({ success: false, message: response.message });
                    case "INCORRECT_PASSWORD":
                        return res
                            .status(401)
                            .json({ success: false, message: response.message });
                    case "BLOCKED":
                        return res
                            .status(403)
                            .json({ success: false, message: response.message });
                    default:
                        return res
                            .status(400)
                            .json({ success: false, message: response.message });
                }
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async resendOtp(req, res, next) {
        try {
            const emailId = req.user.emailId;
            console.log("email", emailId);
            const response = await this.interactor.resendOtp(emailId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
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
    async profile(req, res, next) {
        try {
            const response = await this.interactor.getProfile(req.userData.image);
            req.userData.password = "*******";
            req.userData.image = response.url;
            res.status(200).json({ success: true, userData: req.userData });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async profileUpdate(req, res, next) {
        try {
            console.log("body", req.body);
            console.log("files", req.file);
            const userId = req.userData._id;
            const email = req.user.emailId;
            const user = {
                name: req.body.name,
                email: email,
                phone: req.body.phone,
                dob: req.body.dob,
                image: req.body.image,
                gender: req.body.gender,
                password: req.body.password,
                address: {
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    postalCode: req.body.zip,
                },
                bloodGroup: req.body.bloodGroup,
            };
            const response = await this.interactor.profileUpdate(user, req.file, userId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, data: response.data });
            }
            else {
                res
                    .status(500)
                    .json({
                    success: true,
                    message: response.message
                });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = UserController;
