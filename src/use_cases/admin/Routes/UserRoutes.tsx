import { Route,Routes, useLocation } from "react-router-dom"
import UserLangingPage from "../Pages/UserPages/UserLandingPage"
import UserLoginPage from "../Pages/UserPages/UserLoginPage"
import UserSignUpPage from "../Pages/UserPages/UserSignUpPage"
import UserOtpVerification from "../Pages/UserPages/UserOtpVerification"
import UserProfileLayout from "../Pages/UserPages/UserProfileLayout"
import UserProfile from "../Components/UserComponents/Profile"
import UserAppointments from "../Components/UserComponents/Appointments"
import ErrorPage from "../Components/extra/ErrorPage"
import PasswordResetPage from "../Components/UserComponents/PasswordResetPage"
import BookAppointmentsList from "../Pages/UserPages/BookAppointmentsList"
import UserDoctorDetailPage from "../Pages/UserPages/UserDoctorDetailPage"
import UserPaymentPage from "../Pages/UserPages/UserPaymentPage"
import PaymentSuccessPage from "../Pages/UserPages/PaymentSuccessPage"
import PaymentFailurePage from "../Pages/UserPages/PaymentFailurePage"
import UserWallet from "../Components/UserComponents/Wallet"
import { useContext,useState,useEffect, useCallback } from "react"
import { SocketContext } from "../socketio/SocketIo"
import CallModal from "../Components/extra/CallModal"
import ForgotPassword from "../Components/extra/ForgotPassword"
import ContactPage from "../Pages/UserPages/ContactPage"
import UserAppointmentDetail from "../Components/UserComponents/AppointmentDetail"
import FavoriteDoctors from "../Components/UserComponents/Favorites"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell } from "@fortawesome/free-solid-svg-icons"
import NotificationComponent from "../Components/extra/Notification"
import {toast} from "sonner"
import instance from "../Axios/userInstance"
import { useAppSelector } from "../Redux/hoocks"




const UserRoute=()=>{    

  const socket = useContext(SocketContext);
  const [callData, setCallData] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);
   const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const pathname=useLocation().pathname
    const {user}=useAppSelector((state)=>state.user)


     socket?.on("call-request", (data: any) => {
       console.log("Received call request:", data);
       setCallData(data);
       setShowCallModal(true);
     });
    
  
  useEffect(() => {

    socket?.on("receive_notification", ({ content }) => {
      

      toast.success(content, { richColors: true, duration: 1000 });
      setNotificationCount((prevState) => prevState + 1);
    });
    
    console.log("listening")
   return () => {
     socket?.off("receive_notification");
    
   };
   
  }, [socket]);
   


    const notificationHandler = (open:boolean) => {
      setIsNotificationModalOpen(open)
    };
  const fetchNotificationCount = useCallback(async () => {
    if(!user) return 
    try {
      const response = await instance.get("/profile/notifications/count");
      setNotificationCount(response.data.count);
    } catch (error) {}
  }, [user]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

   const nonValidPaths = [
     "/login",
     "/signup",
     "/otpVerify",
     "/forgotPassword",
     "/reset-password",
   ];

  const dontShow = nonValidPaths.includes(pathname);

    return (
      <div className="relative">
        {showCallModal && (
          <CallModal
            callData={callData}
            onClose={() => setShowCallModal(false)}
          />
        )}

        {dontShow ? (
          <></>
        ) : (
          <div className="fixed bottom-10 right-10 z-30">
            <button
              onClick={() => notificationHandler(true)}
              className="relative focus:ring-4 focus:ring-offset-2 rounded-full p-5 bg-gradient-to-r from-[#928EDE] to-[#6A67CE] text-white shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faBell} className="text-2xl" />

              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            </button>
          </div>
        )}

        {isNotificationModalOpen && (
          <NotificationComponent
            setNotificationCount={setNotificationCount}
            isUser={true}
            notificationHandler={() => notificationHandler(false)}
          />
        )}

        <Routes>
          <Route path="/" element={<UserLangingPage />} />

          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/signup" element={<UserSignUpPage />} />
          <Route path="/otpVerify" element={<UserOtpVerification />} />
          <Route path="/forgotPassword/:request" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/doctorBooking" element={<BookAppointmentsList />} />
          <Route path="/doctorDetail/:id" element={<UserDoctorDetailPage />} />
          <Route path="/payment/:id" element={<UserPaymentPage />} />
          <Route path="/paymentSuccess" element={<PaymentSuccessPage />} />
          <Route path="/paymentFailure" element={<PaymentFailurePage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Profile layout */}
          <Route path="/profile" element={<UserProfileLayout />}>
            <Route path="" element={<UserProfile />} />
            <Route path="appointment" element={<UserAppointments />} />
            <Route path="wallet" element={<UserWallet />} />
            <Route
              path="appointmentDetail/:id"
              element={<UserAppointmentDetail />}
            />
            <Route path="favorites" element={<FavoriteDoctors />} />
          </Route>
          <Route path="*" element={<ErrorPage side="user" />} />
          {/* Profile layout end */}
        </Routes>
      </div>
    );




}
export default UserRoute