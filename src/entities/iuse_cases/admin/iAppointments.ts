import IAppointment from "../../rules/appointments";

interface IAdminAppointmentsInteractor {
  fetchAppointments(
    page: number,
    limit: number
  ): Promise<{ success: boolean; message: string; data?: IAppointment[] }>;
  fetchAppointmentDetail(
    id: string
  ): Promise<{ success: boolean; message: string; data?: IAppointment }>;
}
export default IAdminAppointmentsInteractor