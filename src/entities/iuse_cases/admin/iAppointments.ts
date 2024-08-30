import IAppointment from "../../rules/appointments";

interface IAdminAppointmentsInteractor {
  fetchAppointments(
    page: number,
    limit: number,
    startDate:string,
    endDate:string
  ): Promise<{ success: boolean; message: string; data?: IAppointment[] }>;
  fetchAppointmentDetail(
    id: string
  ): Promise<{ success: boolean; message: string; data?: IAppointment }>;
}
export default IAdminAppointmentsInteractor