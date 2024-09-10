"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const AdminLoginPage_1 = __importDefault(require("../Pages/AdminPages/AdminLoginPage"));
const AdminLayoutPage_1 = __importDefault(require("../Pages/AdminPages/AdminLayoutPage"));
const Dashboard_1 = __importDefault(require("../Components/AdminComponents/Dashboard"));
const UserListing_1 = __importDefault(require("../Components/AdminComponents/UserListing"));
const DepartmentsListing_1 = __importDefault(require("../Components/AdminComponents/DepartmentsListing"));
const UnverifiedDoctorsList_1 = __importDefault(require("../Components/AdminComponents/UnverifiedDoctorsList"));
const DoctorVerify_1 = __importDefault(require("../Components/AdminComponents/DoctorVerify"));
const DoctorListing_1 = __importDefault(require("../Components/AdminComponents/DoctorListing"));
const ErrorPage_1 = __importDefault(require("../Components/extra/ErrorPage"));
const AppointmentsList_1 = __importDefault(require("../Components/AdminComponents/AppointmentsList"));
const ApointmentDetail_1 = __importDefault(require("../Components/AdminComponents/ApointmentDetail"));
const DoctorProfile_1 = __importDefault(require("../Components/AdminComponents/DoctorProfile"));
const UserProfile_1 = __importDefault(require("../Components/AdminComponents/UserProfile"));
const RefundsListing_1 = __importDefault(require("../Components/AdminComponents/RefundsListing"));
const WithdrawalsListing_1 = __importDefault(require("../Components/AdminComponents/WithdrawalsListing"));
const AdminRoute = () => {
    return (<react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/login" element={<AdminLoginPage_1.default />}/>
        <react_router_dom_1.Route path="/" element={<AdminLayoutPage_1.default />}>
          <react_router_dom_1.Route path="" element={<Dashboard_1.default />}/>
          <react_router_dom_1.Route path="departments" element={<DepartmentsListing_1.default />}/>
          <react_router_dom_1.Route path="users" element={<UserListing_1.default />}/>
          <react_router_dom_1.Route path="users/:id" element={<UserProfile_1.default />}/>
          <react_router_dom_1.Route path="doctors" element={<DoctorListing_1.default />}/>
          <react_router_dom_1.Route path="doctors/:id" element={<DoctorProfile_1.default />}/>
          <react_router_dom_1.Route path="verifyDoctor" element={<UnverifiedDoctorsList_1.default />}/>
          <react_router_dom_1.Route path="verifyDoctorDetail/:id" element={<DoctorVerify_1.default />}/>
          <react_router_dom_1.Route path="appointments" element={<AppointmentsList_1.default />}/>
          <react_router_dom_1.Route path="appointments/:id" element={<ApointmentDetail_1.default />}/>
          <react_router_dom_1.Route path="refunds" element={<RefundsListing_1.default />}/>
          <react_router_dom_1.Route path="withdrawals" element={<WithdrawalsListing_1.default />}/>
        </react_router_dom_1.Route>
        <react_router_dom_1.Route path="*" element={<ErrorPage_1.default side="admin"/>}/>
      </react_router_dom_1.Routes>);
};
exports.default = AdminRoute;
