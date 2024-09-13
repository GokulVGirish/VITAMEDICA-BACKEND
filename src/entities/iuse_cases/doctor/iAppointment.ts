import { Types } from "mongoose";
import IAppointment from "../../rules/appointments";
import { MulterFile } from "../../rules/multerFile";


interface IDoctorAppointmentInteractor {
  getTodaysAppointments(docId: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
  }>;
  getUpcommingOrPrevAppointments(
    docId: Types.ObjectId,
    page: number,
    limit: number,
    days: string
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  getAppointmentDetail(id: string): Promise<{
    status: boolean;
    message?: string;
    detail?: IAppointment;
    messages?: {
      sender: string;
      message: string;
      type: string;
      createdAt: Date;
    }[];
  }>;
  addPrescription(
    appointmentId: string,
    prescription: MulterFile
  ): Promise<{ status: boolean; message: string }>;
}
export default IDoctorAppointmentInteractor