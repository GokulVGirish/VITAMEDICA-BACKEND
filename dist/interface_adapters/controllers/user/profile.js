"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserProfileControllers {
    constructor(interactor) {
        this.interactor = interactor;
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
                res.status(200).json({
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
                res.status(200).json({ success: true, imageData: response.imageData });
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
            next(error);
        }
    }
    async fetchNotificationCount(req, res, next) {
        try {
            const userId = req.userData._id;
            const response = await this.interactor.fetchNotificationCount(userId);
            res.status(200).json({ count: response });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async fetchNotifications(req, res, next) {
        try {
            const userId = req.userData._id;
            const response = await this.interactor.fetchNotifications(userId);
            res.status(200).json({ notifications: response });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async markNotificationAsRead(req, res, next) {
        try {
            const userId = req.userData._id;
            const response = await this.interactor.markNotificationAsRead(userId);
            if (response)
                return res.status(200).json({ success: true, message: "Success" });
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async isProfileComplete(req, res, next) {
        try {
            const isComplete = req.userData.isComplete;
            return res.status(200).json({ status: true, message: "Please Complete your Profile", isComplete });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserProfileControllers;
