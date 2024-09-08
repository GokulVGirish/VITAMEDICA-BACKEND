"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ImageUploadController {
    constructor(interactor) {
        this.interactor = interactor;
    }
    async imageUpload(req, res, next) {
        try {
            const id = req.params.appointmentId;
            const sender = req.params.sender;
            console.log("req fike", req.file);
            const response = await this.interactor.uploadImage(id, sender, req.file);
            if (response.success)
                return res.status(200).json({ success: true, message: response.message, url: response.url });
            res.status(500).json({ success: false, message: response.message });
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = ImageUploadController;
