"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hoocks_1 = require("../../Redux/hoocks");
const notverified_png_1 = __importDefault(require("@/assets/notverified.png"));
const verifyToken_1 = __importDefault(require("../../hooks and functions/verifyToken"));
const DoctorProtectedRoutes = ({ children }) => {
    (0, verifyToken_1.default)("doctor");
    const status = (0, hoocks_1.useAppSelector)((state) => state.doctor.docStatus);
    console.log("status", status);
    if (status === "Pending" || status === "Submitted") {
        return (<div className="flex items-center justify-center h-[100vh]">
            <img src={notverified_png_1.default}/>
          </div>);
    }
    else {
        return <>{children}</>;
    }
};
exports.default = DoctorProtectedRoutes;
