"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../../services/multer"));
const authentication_1 = __importDefault(require("../middlewares/authentication"));
const imageUpload_1 = __importDefault(require("../../../interface_adapters/controllers/imageUpload"));
const imageUpload_2 = __importDefault(require("../../../use_cases/imageUpload"));
const imageUploadRepository_1 = __importDefault(require("../../../interface_adapters/repositories/imageUploadRepository"));
const awsS3_1 = __importDefault(require("../../services/awsS3"));
const repository = new imageUploadRepository_1.default();
const awss3 = new awsS3_1.default();
const interactor = new imageUpload_2.default(repository, awss3);
const controller = new imageUpload_1.default(interactor);
const imageUpload = express_1.default.Router();
imageUpload.put("/:appointmentId/:sender", authentication_1.default, multer_1.default.single("image"), controller.imageUpload.bind(controller));
exports.default = imageUpload;
