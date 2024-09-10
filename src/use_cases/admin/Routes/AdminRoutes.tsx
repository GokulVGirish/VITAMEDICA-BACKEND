import { Route,Routes } from "react-router-dom";
import AdminLoginPage from "../Pages/AdminPages/AdminLoginPage";
import AdminLayoutPage from "../Pages/AdminPages/AdminLayoutPage";
import AdminDash from "../Components/AdminComponents/Dashboard";
import UserListing from "../Components/AdminComponents/UserListing";
import DepartmentsListing from "../Components/AdminComponents/DepartmentsListing";
import UnverifiefDoctorsList from "../Components/AdminComponents/UnverifiedDoctorsList";
import DoctorVerify from "../Components/AdminComponents/DoctorVerify";
import DoctorListing from "../Components/AdminComponents/DoctorListing";
import ErrorPage from "../Components/extra/ErrorPage";
import AdminAppointmentListing from "../Components/AdminComponents/AppointmentsList";
import AdminAppointmentDetail from "../Components/AdminComponents/ApointmentDetail";
import AdminDoctorProfile from "../Components/AdminComponents/DoctorProfile";
import AdminUserProfile from "../Components/AdminComponents/UserProfile";
import RefundsListing from "../Components/AdminComponents/RefundsListing";
import WithdrawalListing from "../Components/AdminComponents/WithdrawalsListing";

const AdminRoute=()=>{
    return (
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/" element={<AdminLayoutPage />}>
          <Route path="" element={<AdminDash />} />
          <Route path="departments" element={<DepartmentsListing />} />
          <Route path="users" element={<UserListing />} />
          <Route path="users/:id" element={<AdminUserProfile/>}/>
          <Route path="doctors" element={<DoctorListing />} />
          <Route path="doctors/:id" element={<AdminDoctorProfile/>}/>
          <Route path="verifyDoctor" element={<UnverifiefDoctorsList />} />
          <Route path="verifyDoctorDetail/:id" element={<DoctorVerify />} />
          <Route path="appointments" element={<AdminAppointmentListing/>}/>
          <Route path="appointments/:id" element={<AdminAppointmentDetail/>}/>
          <Route path="refunds" element={<RefundsListing/>}/>
          <Route path="withdrawals" element={<WithdrawalListing/>}/>
        </Route>
        <Route path="*" element={<ErrorPage side="admin" />} />
      </Routes>
    );
}
export default AdminRoute