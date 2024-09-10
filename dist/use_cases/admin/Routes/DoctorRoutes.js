"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const DoctorLoginPage_1 = __importDefault(require("../Pages/DoctorPages/DoctorLoginPage"));
const DoctorSignUpPage_1 = __importDefault(require("../Pages/DoctorPages/DoctorSignUpPage"));
const DoctorLayout_1 = __importDefault(require("../Pages/DoctorPages/DoctorLayout"));
const Dashboard_1 = __importDefault(require("../Components/DoctorComponents/Dashboard"));
const Profile_1 = __importDefault(require("../Components/DoctorComponents/Profile"));
const DoctorOtpVerification_1 = __importDefault(require("../Pages/DoctorPages/DoctorOtpVerification"));
const hoocks_1 = require("../Redux/hoocks");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const DocumentUpload_1 = __importDefault(require("../Components/DoctorComponents/DocumentUpload"));
const AddSlots_1 = __importDefault(require("../Components/DoctorComponents/AddSlots"));
const ErrorPage_1 = __importDefault(require("../Components/extra/ErrorPage"));
const Wallet_1 = __importDefault(require("../Components/DoctorComponents/Wallet"));
const Appointments_1 = __importDefault(require("../Components/DoctorComponents/Appointments"));
const doctorProtectedRoutes_1 = __importDefault(require("./ProtectedRoutes/doctorProtectedRoutes"));
const UserProfile_1 = __importDefault(require("../Components/DoctorComponents/UserProfile"));
const videoCall_1 = __importDefault(require("../communication/videoCall"));
const react_1 = require("react");
const SocketIo_1 = require("../socketio/SocketIo");
const doctorSlice_1 = require("../Redux/doctorSlice");
const sonner_1 = require("sonner");
const Notification_1 = __importDefault(require("../Components/extra/Notification"));
const doctorInstance_1 = __importDefault(require("../Axios/doctorInstance"));
const Dummy = () => {
    const status = (0, hoocks_1.useAppSelector)((state) => state.doctor.docStatus);
    const navigate = (0, react_router_dom_1.useNavigate)();
    if (status === "Verified") {
        return null;
    }
    if (status === "Submitted") {
        return (<>
        <div id="modal-box" className="absolute top-32 right-0 items-center sm:w-[385px] sm:min-w-[40vw] min-w-[80vw] min-h-[20vh] flex flex-col justify-center gap-2 -translate-y-1/2 p-6 bg-[#FFFFEB] rounded-lg -translate-x-1/2">
          <span className="text-2xl font-bold">
            Documents Uploaded For Verification
          </span>
          <p className="text-center font-semibold">
            Waiting For Admin Approval
          </p>
          <react_fontawesome_1.FontAwesomeIcon size="4x" icon={free_solid_svg_icons_1.faCircleCheck}/>
        </div>
      </>);
    }
    if (status === "Pending") {
        return (<>
        <div id="modal-box" className="absolute z-20 top-32 right-0 items-center sm:w-[385px] sm:min-w-[40vw] min-w-[80vw] min-h-[20vh] flex flex-col justify-center gap-2 -translate-y-1/2 p-6 bg-[#FFFFEB] rounded-lg -translate-x-1/2">
          <span className="text-2xl font-bold">Upload Documents</span>
          <p className="text-center font-semibold">
            Upload the necessary documents and get verified to be a part of
            VITAMEDICA
          </p>
          <button onClick={() => navigate("/doctor/uploadDocs")} id="modal-close" className="p-3 bg-[#4F46E5] rounded-lg w-1/2 text-white">
            Proceed To Upload
          </button>
        </div>
      </>);
    }
    return null;
};
const DoctorRoute = () => {
    const location = (0, react_router_dom_1.useLocation)();
    const socket = (0, react_1.useContext)(SocketIo_1.SocketContext);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = (0, react_1.useState)(false);
    const [notificationCount, setNotificationCount] = (0, react_1.useState)(0);
    const dispatch = (0, hoocks_1.useAppDispatch)();
    const validPaths = [
        "/doctor",
        "/doctor/addSlot",
        "/doctor/wallet",
        "/doctor/appointment",
        "/doctor/profile",
    ];
    const isBasePath = validPaths.includes(location.pathname);
    const showDummy = isBasePath;
    (0, react_1.useEffect)(() => {
        socket?.on("doctorVerified", () => {
            sonner_1.toast.success("Doctor Is Verified", {
                richColors: true,
                duration: 1500,
                onAutoClose: () => {
                    dispatch((0, doctorSlice_1.verifyDoctor)({ status: "Verified" }));
                },
            });
        });
        socket?.on("receive_notification", ({ content }) => {
            console.log("in here notificationsss");
            sonner_1.toast.success(content, { richColors: true, duration: 1000 });
            setNotificationCount((prevState) => prevState + 1);
        });
        return () => {
            socket?.off("receive_notification");
            socket?.off("doctorVerified");
        };
    }, [socket]);
    const notificationHandler = (open) => {
        setIsNotificationModalOpen(open);
    };
    const fetchNotificationCount = (0, react_1.useCallback)(async () => {
        try {
            const response = await doctorInstance_1.default.get("/profile/notifications/count");
            setNotificationCount(response.data.count);
        }
        catch (error) { }
    }, []);
    (0, react_1.useEffect)(() => {
        fetchNotificationCount();
    }, [fetchNotificationCount]);
    return (<div className="relative">
      {showDummy && <Dummy />}
      {showDummy && (<div className="fixed bottom-10 right-10 z-30">
          <button onClick={() => notificationHandler(true)} className="relative focus:ring-4 focus:ring-offset-2 rounded-full p-5 bg-gradient-to-r from-[#56aac6] to-[#4b99b5] text-white shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <react_fontawesome_1.FontAwesomeIcon icon={free_solid_svg_icons_1.faBell} className="text-2xl"/>

            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          </button>
        </div>)}

      {isNotificationModalOpen && (<Notification_1.default setNotificationCount={setNotificationCount} isUser={false} notificationHandler={() => notificationHandler(false)}/>)}

      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/" element={<DoctorLayout_1.default />}>
          <react_router_dom_1.Route index element={<doctorProtectedRoutes_1.default>
                <Dashboard_1.default />
              </doctorProtectedRoutes_1.default>}/>
          <react_router_dom_1.Route path="profile" element={<doctorProtectedRoutes_1.default>
                <Profile_1.default />
              </doctorProtectedRoutes_1.default>}/>
          <react_router_dom_1.Route path="/uploadDocs" element={<DocumentUpload_1.default />}/>
          <react_router_dom_1.Route path="addSlot" element={<doctorProtectedRoutes_1.default>
                <AddSlots_1.default />
              </doctorProtectedRoutes_1.default>}/>
          <react_router_dom_1.Route path="wallet" element={<doctorProtectedRoutes_1.default>
                <Wallet_1.default />
              </doctorProtectedRoutes_1.default>}/>
          <react_router_dom_1.Route path="appointment" element={<doctorProtectedRoutes_1.default>
                <Appointments_1.default />
              </doctorProtectedRoutes_1.default>}/>
          <react_router_dom_1.Route path="userProfile/:id" element={<UserProfile_1.default />}/>
        </react_router_dom_1.Route>
        <react_router_dom_1.Route path="/login" element={<DoctorLoginPage_1.default />}/>
        <react_router_dom_1.Route path="/signup" element={<DoctorSignUpPage_1.default />}/>
        <react_router_dom_1.Route path="/videocall/:appointment/:callerId/:toPersonId/:role" element={<videoCall_1.default />}/>
        <react_router_dom_1.Route path="/otpVerify" element={<DoctorOtpVerification_1.default />}/>
        <react_router_dom_1.Route path="*" element={<ErrorPage_1.default side="doctor"/>}/>
      </react_router_dom_1.Routes>
    </div>);
};
exports.default = DoctorRoute;
