import { Types } from "mongoose";
import IAppointment from "../../rules/appointments";
import { MulterFile } from "../../rules/multerFile";


interface IDoctorAppointmentInteractor {
  getTodaysAppointments(docId: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
  }>;
  getUpcommingAppointments(
    docId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  getAppointmentDetail(
    id: string
  ): Promise<{ status: boolean; message?: string; detail?: IAppointment }>;
  addPrescription(
    appointmentId: string,
    prescription: MulterFile
  ): Promise<{ status: boolean; message: string }>;
}
export default IDoctorAppointmentInteractor