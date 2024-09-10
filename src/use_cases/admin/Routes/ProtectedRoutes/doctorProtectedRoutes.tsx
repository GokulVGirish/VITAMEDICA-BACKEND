import { ReactNode } from "react"
import { useAppSelector} from "../../Redux/hoocks"
import logo from "@/assets/notverified.png";
import useVerifyToken from "../../hooks and functions/verifyToken";



const DoctorProtectedRoutes=({children}:{children:ReactNode})=>{
    useVerifyToken("doctor")

    const status=useAppSelector((state)=>state.doctor.docStatus)
    console.log("status",status)

     if (status === "Pending" || status === "Submitted") {
        return (
          <div className="flex items-center justify-center h-[100vh]">
            <img src={logo} />
          </div>
        );
       
     } else {
        return <>{children}</>;
       
     }



}
export default DoctorProtectedRoutes