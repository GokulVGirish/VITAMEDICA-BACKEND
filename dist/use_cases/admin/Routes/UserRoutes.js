"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const UserLandingPage_1 = __importDefault(require("../Pages/UserPages/UserLandingPage"));
const UserLoginPage_1 = __importDefault(require("../Pages/UserPages/UserLoginPage"));
const UserSignUpPage_1 = __importDefault(require("../Pages/UserPages/UserSignUpPage"));
const UserOtpVerification_1 = __importDefault(require("../Pages/UserPages/UserOtpVerification"));
const UserProfileLayout_1 = __importDefault(require("../Pages/UserPages/UserProfileLayout"));
const Profile_1 = __importDefault(require("../Components/UserComponents/Profile"));
const Appointments_1 = __importDefault(require("../Components/UserComponents/Appointments"));
const ErrorPage_1 = __importDefault(require("../Components/extra/ErrorPage"));
const PasswordResetPage_1 = __importDefault(require("../Components/UserComponents/PasswordResetPage"));
const BookAppointmentsList_1 = __importDefault(require("../Pages/UserPages/BookAppointmentsList"));
const UserDoctorDetailPage_1 = __importDefault(require("../Pages/UserPages/UserDoctorDetailPage"));
const UserPaymentPage_1 = __importDefault(require("../Pages/UserPages/UserPaymentPage"));
const PaymentSuccessPage_1 = __importDefault(require("../Pages/UserPages/PaymentSuccessPage"));
const PaymentFailurePage_1 = __importDefault(require("../Pages/UserPages/PaymentFailurePage"));
const Wallet_1 = __importDefault(require("../Components/UserComponents/Wallet"));
const react_1 = require("react");
const SocketIo_1 = require("../socketio/SocketIo");
const CallModal_1 = __importDefault(require("../Components/extra/CallModal"));
const ForgotPassword_1 = __importDefault(require("../Components/extra/ForgotPassword"));
const ContactPage_1 = __importDefault(require("../Pages/UserPages/ContactPage"));
const AppointmentDetail_1 = __importDefault(require("../Components/UserComponents/AppointmentDetail"));
const Favorites_1 = __importDefault(require("../Components/UserComponents/Favorites"));
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const Notification_1 = __importDefault(require("../Components/extra/Notification"));
const sonner_1 = require("sonner");
const userInstance_1 = __importDefault(require("../Axios/userInstance"));
const hoocks_1 = require("../Redux/hoocks");
const UserRoute = () => {
    const socket = (0, react_1.useContext)(SocketIo_1.SocketContext);
    const [callData, setCallData] = (0, react_1.useState)(null);
    const [showCallModal, setShowCallModal] = (0, react_1.useState)(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = (0, react_1.useState)(false);
    const [notificationCount, setNotificationCount] = (0, react_1.useState)(0);
    const pathname = (0, react_router_dom_1.useLocation)().pathname;
    const { user } = (0, hoocks_1.useAppSelector)((state) => state.user);
    socket?.on("call-request", (data) => {
        console.log("Received call request:", data);
        setCallData(data);
        setShowCallModal(true);
    });
    (0, react_1.useEffect)(() => {
        socket?.on("receive_notification", ({ content }) => {
            sonner_1.toast.success(content, { richColors: true, duration: 1000 });
            setNotificationCount((prevState) => prevState + 1);
        });
        console.log("listening");
        return () => {
            socket?.off("receive_notification");
        };
    }, [socket]);
    const notificationHandler = (open) => {
        setIsNotificationModalOpen(open);
    };
    const fetchNotificationCount = (0, react_1.useCallback)(async () => {
        if (!user)
            return;
        try {
            const response = await userInstance_1.default.get("/profile/notifications/count");
            setNotificationCount(response.data.count);
        }
        catch (error) { }
    }, [user]);
    (0, react_1.useEffect)(() => {
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
    return (<div className="relative">
        {showCallModal && (<CallModal_1.default callData={callData} onClose={() => setShowCallModal(false)}/>)}

        {dontShow ? (<></>) : (<div className="fixed bottom-10 right-10 z-30">
            <button onClick={() => notificationHandler(true)} className="relative focus:ring-4 focus:ring-offset-2 rounded-full p-5 bg-gradient-to-r from-[#928EDE] to-[#6A67CE] text-white shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
              <react_fontawesome_1.FontAwesomeIcon icon={free_solid_svg_icons_1.faBell} className="text-2xl"/>

              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            </button>
          </div>)}

        {isNotificationModalOpen && (<Notification_1.default setNotificationCount={setNotificationCount} isUser={true} notificationHandler={() => notificationHandler(false)}/>)}

        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/" element={<UserLandingPage_1.default />}/>

          <react_router_dom_1.Route path="/login" element={<UserLoginPage_1.default />}/>
          <react_router_dom_1.Route path="/signup" element={<UserSignUpPage_1.default />}/>
          <react_router_dom_1.Route path="/otpVerify" element={<UserOtpVerification_1.default />}/>
          <react_router_dom_1.Route path="/forgotPassword/:request" element={<ForgotPassword_1.default />}/>
          <react_router_dom_1.Route path="/reset-password" element={<PasswordResetPage_1.default />}/>
          <react_router_dom_1.Route path="/doctorBooking" element={<BookAppointmentsList_1.default />}/>
          <react_router_dom_1.Route path="/doctorDetail/:id" element={<UserDoctorDetailPage_1.default />}/>
          <react_router_dom_1.Route path="/payment/:id" element={<UserPaymentPage_1.default />}/>
          <react_router_dom_1.Route path="/paymentSuccess" element={<PaymentSuccessPage_1.default />}/>
          <react_router_dom_1.Route path="/paymentFailure" element={<PaymentFailurePage_1.default />}/>
          <react_router_dom_1.Route path="/contact" element={<ContactPage_1.default />}/>

          {/* Profile layout */}
          <react_router_dom_1.Route path="/profile" element={<UserProfileLayout_1.default />}>
            <react_router_dom_1.Route path="" element={<Profile_1.default />}/>
            <react_router_dom_1.Route path="appointment" element={<Appointments_1.default />}/>
            <react_router_dom_1.Route path="wallet" element={<Wallet_1.default />}/>
            <react_router_dom_1.Route path="appointmentDetail/:id" element={<AppointmentDetail_1.default />}/>
            <react_router_dom_1.Route path="favorites" element={<Favorites_1.default />}/>
          </react_router_dom_1.Route>
          <react_router_dom_1.Route path="*" element={<ErrorPage_1.default side="user"/>}/>
          {/* Profile layout end */}
        </react_router_dom_1.Routes>
      </div>);
};
exports.default = UserRoute;
