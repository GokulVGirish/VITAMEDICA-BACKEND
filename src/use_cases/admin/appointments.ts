import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAppointment from "../../entities/rules/appointments";
import { IawsS3 } from "../../entities/services/awsS3";


class AdminAppointmentsInteractor {

  constructor(private readonly repository: IAdminRepository,private readonly AwsS3:IawsS3) {}
  async fetchAppointments(
    page: number,
    limit: number,
    startDate:string,
    endDate:string
  ): Promise<{ success: boolean; message: string; data?: IAppointment[] }> {
    try {
      const result = await this.repository.fetchAppointments(page, limit,startDate,endDate);
      return { success: true, message: "Sucess", data: result };
    } catch (error) {
      throw error;
    }
  }
  async fetchAppointmentDetail(
    id: string
  ): Promise<{ success: boolean; message: string; data?: IAppointment }> {
    try {
      const result = await this.repository.fetchAppointmentDetail(id);
      if (result) {
        if ("docImage" in result && result.docImage) {
          const command = this.AwsS3.getObjectCommandS3(
            result.docImage as string
          );
          const url=await this.AwsS3.getSignedUrlS3(command,3600)
          
          result.docImage = url;
        }
        if ("userImage" in result && result.userImage) {
         
           const command = this.AwsS3.getObjectCommandS3(
             result.userImage as string
           );
            const url = await this.AwsS3.getSignedUrlS3(command, 3600);
          result.userImage = url;
        }
        if (result.status === "completed") {
         
           const command = this.AwsS3.getObjectCommandS3(
             result.prescription as string
           );
          const url = await this.AwsS3.getSignedUrlS3(command, 3600);
          result.prescription = url;
        }
      }
      return { success: true, message: "Success", data: result };
    } catch (error) {
      throw error;
    }
  }
}
export default AdminAppointmentsInteractor