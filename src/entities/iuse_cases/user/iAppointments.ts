import { Types } from "mongoose";
import IAppointment from "../../rules/appointments";


interface IUserAppointmentInteractor {
  razorPayOrderGenerate(
    amount: string,
    currency: string,
    receipt: string
  ): Promise<{ status: boolean; order?: any; message: string }>;
  razorPayValidateBook(
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string,
    docId: Types.ObjectId,
    slotDetails: any,
    userId: Types.ObjectId,
    fees: string
  ): Promise<{ status: boolean; message?: string; appointment?: IAppointment }>;
  lockSlot(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: Date,
    slotId: Types.ObjectId
  ): Promise<{ status: boolean; message?: string; errorCode?: string }>;
  getAppointments(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }>;
  cancelAppointment(
    userId: Types.ObjectId,
    appointmentId: string,
    date: Date,
    startTime: Date,
    reason: string
  ): Promise<{ status: boolean; message: string }>;
  getAppointmentDetail(id: string): Promise<{
    status: boolean;
    message: string;
    appointmentDetail?: IAppointment;
  }>;
  addReview(
    appointmentId: string,
    userId: Types.ObjectId,
    docId: string,
    rating: number,
    description?: string
  ): Promise<{ status: boolean; message: string }>;
}
export default IUserAppointmentInteractor