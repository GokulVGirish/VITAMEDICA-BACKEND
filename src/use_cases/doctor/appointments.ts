import { Types } from "mongoose";
import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import IDoctorAppointmentInteractor from "../../entities/iuse_cases/doctor/iAppointment";
import IAppointment from "../../entities/rules/appointments";
import  { IawsS3 } from "../../entities/services/awsS3";
import { MulterFile } from "../../entities/rules/multerFile";




class DoctorAppointmentInteractor implements IDoctorAppointmentInteractor {
  constructor(
    private readonly Repository: IDoctorRepository,
    private readonly AwsS3: IawsS3
  ) {}
  async getTodaysAppointments(docId: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
  }> {
    try {
      const response = await this.Repository.getTodaysAppointments(docId);
      if (response) {
        return { status: true, message: "Success", appointments: response };
      }
      return { status: false, message: "no appointments" };
    } catch (error) {
      throw error;
    }
  }
  async getUpcommingOrPrevAppointments(
    docId: Types.ObjectId,
    page: number,
    limit: number,
    days:string
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }> {
    try {
      const response = await this.Repository.getUpcommingOrPrevAppointments(
        docId,
        page,
        limit,
        days
      );
      if (!response.status)
        return { status: false, message: "no appointments" };
      return {
        status: true,
        message: "success",
        appointments: response.appointments,
        totalPages: response.totalPages,
      };
    } catch (error) {
      throw error;
    }
  }
  async getAppointmentDetail(id: string): Promise<{
    status: boolean;
    message?: string;
    detail?: IAppointment;
    messages?: {
      sender: string;
      message: string;
      type: string;
      createdAt: Date;
    }[];
  }> {
    try {
      const response = await this.Repository.getAppointmentDetail(id);
      if (!response) return { status: false, message: "Something Went Wrong" };

      if ("image" in response && response.image) {
        const command = this.AwsS3.getObjectCommandS3(response.image as string);
        const url = await this.AwsS3.getSignedUrlS3(command, 3600);
        response.image = url;
      }
      if ("prescription" in response && response.prescription) {
        const command = this.AwsS3.getObjectCommandS3(
          response.prescription as string
        );
        const url = await this.AwsS3.getSignedUrlS3(command, 3600);

        response.prescription = url;
      }
      const messages = await this.Repository.getMessages(id);
      for (let message of messages) {
        if (message.type === "img") {
          const command = this.AwsS3.getObjectCommandS3(message.message);
          const url = await this.AwsS3.getSignedUrlS3(command, 3600);
          message.message = url;
        }
      }
      const signedRecords = [];
      if (response.medicalRecords.length > 0) {
        for (let medicalRecord of response.medicalRecords) {
          const command = this.AwsS3.getObjectCommandS3(medicalRecord);
          const url = await this.AwsS3.getSignedUrlS3(command, 3600);
          signedRecords.push(url);
        }
      }
      response.medicalRecords = signedRecords;

      return {
        status: true,
        message: "Success",
        detail: response,
        messages: messages,
      };
    } catch (error) {
      throw error;
    }
  }
  async addPrescription(
    appointmentId: string,
    prescription: MulterFile
  ): Promise<{ status: boolean; message: string }> {
    try {
      const folderPath = "prescriptions";
      const fileExtension = prescription.originalname.split(".").pop();
      const uniqueFileName = `prescription-${appointmentId}.${fileExtension}`;
      const key = `${folderPath}/${uniqueFileName}`;
      await this.AwsS3.putObjectCommandS3(
        key,
        prescription.buffer,
        prescription.mimetype
      );
      const response = await this.Repository.addPrescription(
        appointmentId,
        key
      );
      if (response) return { status: true, message: "Sucessfully added" };
      return { status: false, message: "Internal Server Error" };
    } catch (error) {
      throw error;
    }
  }
}
export default DoctorAppointmentInteractor