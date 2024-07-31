"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminController {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.interactor.adminLogin(email, password);
            if (response.status) {
                res.status(200).json({ success: true, adminAccessToken: response.adminAccessToken, adminRefreshToken: response.adminRefreshToken, message: "logged in sucessfully" });
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
    async getDepartments(req, res, next) {
        try {
            const response = await this.interactor.getDepartments();
            if (response.status) {
                res.status(200).json({ success: true, departments: response.departments });
            }
            else {
                res
                    .status(500)
                    .json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async addDepartment(req, res, next) {
        try {
            const departmentName = req.body.department;
            console.log("body", req.body);
            const response = await this.interactor.addDepartment(departmentName);
            if (response.status) {
                res.status(200).json({ success: true, department: response.department, message: "Department added" });
            }
            else {
                res
                    .status(500)
                    .json({
                    success: false,
                    message: response.message,
                });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async deleteDepartment(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.interactor.deleteDepartment(id);
            if (response.status) {
                res.status(200).json({ success: true, message: response.message });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getUsers(req, res, next) {
        try {
            const response = await this.interactor.getUsers();
            if (response.status) {
                res.status(200).json({ success: true, message: response.message, users: response.users });
            }
            else {
                res
                    .status(500)
                    .json({
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
    async blockUnblockUser(req, res, next) {
        try {
            const userId = req.params.id;
            const status = req.params.status;
            const response = await this.interactor.blockUnblockUser(userId, status);
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
    async getUnverifiedDoctors(req, res, next) {
        try {
            const response = await this.interactor.getUnverifiedDoctors();
            if (response.status) {
                res.status(200).json({ success: true, doctors: response.doctors });
            }
            else {
                res
                    .status(500)
                    .json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async getDoctorDocs(req, res, next) {
        try {
            const id = req.params.id;
            console.log("helloooo");
            const response = await this.interactor.getDoctorDocs(id);
            if (response.status) {
                res.status(200).json({ success: true, doctor: response.doctor });
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
    async verifyDoctor(req, res, next) {
        try {
            const id = req.params.id;
            const response = await this.interactor.verifyDoctor(id);
            if (response) {
                res.status(200).json({ success: true });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getDoctors(req, res, next) {
        try {
            const response = await this.interactor.getDoctors();
            if (response.status) {
                res.status(200).json({ success: true, doctors: response.doctors });
            }
            else {
                res.status(500).json({ success: false });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async doctorBlockUnblock(req, res, next) {
        try {
            const docId = req.params.id;
            const status = req.params.status;
            console.log("clicked");
            const response = await this.interactor.blockUnblockDoctor(docId, status);
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
}
exports.default = AdminController;
