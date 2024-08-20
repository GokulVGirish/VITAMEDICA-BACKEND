"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminDepartmentControllers {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async getDepartments(req, res, next) {
        try {
            const response = await this.interactor.getDepartments();
            if (response.status) {
                res
                    .status(200)
                    .json({ success: true, departments: response.departments });
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
    async addDepartment(req, res, next) {
        try {
            const departmentName = req.body.department;
            console.log("body", req.body);
            const response = await this.interactor.addDepartment(departmentName);
            if (response.status) {
                res
                    .status(200)
                    .json({
                    success: true,
                    department: response.department,
                    message: "Department added",
                });
            }
            else {
                res.status(500).json({
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
                res.status(500).json({ success: false, message: response.message });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = AdminDepartmentControllers;
