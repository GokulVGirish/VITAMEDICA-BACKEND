
import express from "express"
import upload from "../../services/multer"
import authMiddleware from "../middlewares/authentication"
import ImageUploadController from "../../../interface_adapters/controllers/imageUpload"
import ImageUploadInteractor from "../../../use_cases/imageUpload"
import ImageUploadRepository from "../../../interface_adapters/repositories/imageUploadRepository"
import AwsS3 from "../../services/awsS3"

const repository=new ImageUploadRepository()
const awss3=new AwsS3()
const interactor=new ImageUploadInteractor(repository,awss3)
const controller=new ImageUploadController(interactor)

const imageUpload=express.Router()

imageUpload.put("/:appointmentId/:sender",authMiddleware, upload.single("image"),controller.imageUpload.bind(controller));
export default imageUpload


