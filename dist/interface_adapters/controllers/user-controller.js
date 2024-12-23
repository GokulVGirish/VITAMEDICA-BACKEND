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
                res.status(200).json({
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
                res.status(200).json({
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
                res.status(200).json({
                    success: true,
                    message: "logged in Sucessfully",
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    userId: response.userId,
                    name: response.name
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
                        return res
                            .status(404)
                            .json({ success: false, message: response.message });
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
            res
                .status(200)
                .json({ success: true, userData: req.userData });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async profileUpdate(req, res, next) {
        try {
            const userId = req.userData._id;
            const email = req.userData.email;
            const user = {
                name: req.body.name,
                phone: req.body.phone,
                dob: req.body.dob,
                gender: req.body.gender,
                address: {
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    postalCode: req.body.zip,
                },
                bloodGroup: req.body.bloodGroup,
            };
            console.log("userdata", user);
            const response = await this.interactor.profileUpdate(user, userId, email);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            }
            else {
                res.status(500).json({
                    success: true,
                    message: response.message,
                });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async ProfilePictureUpdate(req, res, next) {
        try {
            const userId = req.userData._id;
            const response = await this.interactor.updateProfileImage(userId, req.file);
            if (response.status) {
                res
                    .status(200)
                    .json({ success: true, imageData: response.imageData });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async passwordResetLink(req, res, next) {
        try {
            const email = req.body.email;
            const response = await this.interactor.passwordResetLink(email);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const token = req.params.token;
            const password = req.body.password;
            const response = await this.interactor.resetPassword(token, password);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDoctorList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;
            const response = await this.interactor.getDoctorsList(skip, limit);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message, doctors: response.doctors, totalPages: response.totalPages });
            else
                res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getDoctorPage(req, res, next) {
        try {
            const { id } = req.params;
            const response = await this.interactor.getDoctorPage(id);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, doctor: response.doctor });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async getAvailableDate(req, res, next) {
        try {
            const { doctorId } = req.params;
            const response = await this.interactor.getAvailableDate(doctorId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, dates: response.dates });
            }
            else {
                res
                    .status(404)
                    .json({
                    success: false,
                    message: response.message,
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async getTimeSlots(req, res, next) {
        try {
            const date = req.query.date;
            const id = req.params.doctorId;
            const response = await this.interactor.getTimeSlots(id, date);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, slots: response.slots });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async razorPayOrder(req, res, next) {
        try {
            console.log("inside");
            const body = req.body;
            const response = await this.interactor.razorPayOrderGenerate(body.amount, body.currency, body.receipt);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, order: response.order });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async razorPayValidate(req, res, next) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, docId, slotDetails, fees } = req.body;
            const userId = req.userData._id;
            const response = await this.interactor.razorPayValidateBook(razorpay_order_id, razorpay_payment_id, razorpay_signature, docId, slotDetails, userId, fees);
            console.log("response", response);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, appointment: response.appointment });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
            throw error;
        }
    }
    async lockSlot(req, res, next) {
        try {
            const { doctorId, date, slotId } = req.body;
            console.log("docId", doctorId, "date", date, "slotId", slotId);
            const usertId = req.userData._id;
            const response = await this.interactor.lockSlot(usertId, doctorId, date, slotId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(400).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
            throw error;
        }
    }
    async getAppointments(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.userData._id;
            const response = await this.interactor.getAppointments(page, limit, userId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, appointments: response.appointments, totalPage: response.totalPages });
            }
            else {
                res.status(404).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getWalletInfo(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.userData._id;
            const response = await this.interactor.getWalletInfo(page, limit, userId);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, walletDetail: response.userWallet, totalPages: response.totalPages });
            }
            else {
                res.status(404).json({ success: false, message: response.message });
            }
        }
        catch (error) {
        }
    }
    async cancelAppointment(req, res, next) {
        try {
            const userId = req.userData._id;
            const appointmentId = req.params.appointmentId;
            const date = new Date(req.query.date);
            const startTime = new Date(req.query.startTime);
            const response = await this.interactor.cancelAppointment(userId, appointmentId, date, startTime);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async addReview(req, res, next) {
        try {
            const { docId, rating, description } = req.body;
            const appointmentId = req.params.appointmentId;
            const userId = req.userData._id;
            console.log('docid', docId, "rating", rating, "description", description, "apppin", appointmentId, "userId", userId);
            const response = await this.interactor.addReview(appointmentId, userId, docId, rating, description);
            if (response.status)
                return res.status(200).json({ success: true, message: response.message });
            return res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserController;
