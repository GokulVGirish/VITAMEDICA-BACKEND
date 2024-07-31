"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = __importDefault(require("../../../interface_adapters/controllers/doctor-controller"));
const doctorInteractor_1 = __importDefault(require("../../../use_cases/doctorInteractor"));
const doctorRepository_1 = __importDefault(require("../../../interface_adapters/repositories/doctorRepository"));
const mailer_1 = __importDefault(require("../../services/mailer"));
const jwt_generate_1 = __importDefault(require("../../services/jwt-generate"));
const jwt_verify_1 = __importDefault(require("../../services/jwt-verify"));
const role_Authenticate_1 = __importDefault(require("../middlewares/role-Authenticate"));
const doctor_1 = require("../middlewares/doctor");
const multer_1 = __importDefault(require("../../services/multer"));
const fields = [
    { name: "file1", maxCount: 1 },
    { name: "file2", maxCount: 1 },
    { name: "file3", maxCount: 1 },
    { name: "file4", maxCount: 1 },
];
const mailer = new mailer_1.default();
const jwtService = new jwt_generate_1.default(process.env.ACCESS_TOCKEN_SECRET, process.env.REFRESH_TOCKEN_SECRET);
const repository = new doctorRepository_1.default();
const interactor = new doctorInteractor_1.default(repository, mailer, jwtService);
const controller = new doctor_controller_1.default(interactor);
const doctorRouter = express_1.default.Router();
doctorRouter.get("/department", controller.getDepartments.bind(controller));
doctorRouter.post("/signup", controller.otpSignup.bind(controller));
doctorRouter.get("/verify-token", jwt_verify_1.default, (0, role_Authenticate_1.default)("doctor"), doctor_1.getDoctor, controller.verifyToken.bind(controller));
doctorRouter.post("/verifyOtpSignup", jwt_verify_1.default, controller.verifyOtpSignup.bind(controller));
doctorRouter.post("/login", controller.login.bind(controller));
doctorRouter.get("/profile", jwt_verify_1.default, doctor_1.getDoctor, controller.getProfile.bind(controller));
doctorRouter.post("/docUpload", jwt_verify_1.default, (0, role_Authenticate_1.default)("doctor"), doctor_1.getDoctor, multer_1.default.array("images"), controller.uploadDocuments.bind(controller));
doctorRouter.post("/resendOtp", jwt_verify_1.default, controller.resendOtp.bind(controller));
exports.default = doctorRouter;
