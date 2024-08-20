"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorExtraControllers {
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
    async uploadDocuments(req, res, next) {
        try {
            console.log("files", req.files);
            let files = [];
            if (Array.isArray(req.files)) {
                files = req.files;
            }
            else if (req.files && typeof req.files === "object") {
                files = Object.values(req.files).flat();
            }
            if (files.length !== 4) {
                return res
                    .status(400)
                    .json({ status: false, message: "Exactly 4 images are required" });
            }
            const [file1, file2, file3, file4] = files;
            const docId = req.doctorData._id.toString();
            const response = await this.interactor.documentsUpload(docId, file1, file2, file3, file4);
            if (response.status) {
                res.status(200).json({ message: "success", status: "Submitted" });
            }
            else {
                res.status(500).json({ message: "failed" });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
exports.default = DoctorExtraControllers;
