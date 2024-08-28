import { Types } from "mongoose";
import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import IDoctorUtilityInteractor from "../../entities/iuse_cases/doctor/iDoctorUtilities";
import MongoDepartment from "../../entities/rules/departments";
import { MulterFile } from "../../entities/rules/multerFile";
import { IawsS3 } from "../../entities/services/awsS3";



class DoctorUtilityInteractor implements IDoctorUtilityInteractor {
  constructor(private readonly Repository: IDoctorRepository,private readonly AwsS3:IawsS3) {}
  async getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }> {
    try {
      const response = await this.Repository.getDepartments();
      if (response.status) {
        return { status: true, departments: response.departments };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async documentsUpload(
    docId: string,
    file1: MulterFile,
    file2: MulterFile,
    file3: MulterFile,
    file4: MulterFile
  ): Promise<{ status: boolean }> {
    try {
      const folderName = `doctorDocs/${docId}-doc`;
      const certificateImageKey = `${folderName}/certificateImage-${docId}.${
        file1.mimetype.split("/")[1]
      }`;
      const qualificationImageKey = `${folderName}/qualificationImage-${docId}.${
        file2.mimetype.split("/")[1]
      }`;
      const aadharFrontKey = `${folderName}/aadharFront-${docId}.${
        file3.mimetype.split("/")[1]
      }`;
      const aadharBackKey = `${folderName}/aadharBack-${docId}.${
        file4.mimetype.split("/")[1]
      }`;
      await this.AwsS3.putObjectCommandS3(certificateImageKey,file1.buffer,file1.mimetype);
      await this.AwsS3.putObjectCommandS3(qualificationImageKey,file2.buffer,file2.mimetype);
      await this.AwsS3.putObjectCommandS3(aadharFrontKey,file3.buffer,file3.mimetype);
      await this.AwsS3.putObjectCommandS3(aadharBackKey,file4.buffer,file4.mimetype);
     await this.Repository.documentsUpdate(
        docId,
        certificateImageKey,
        qualificationImageKey,
        aadharFrontKey,
        aadharBackKey
      );
      await this.Repository.docStatusChange(docId, "Submitted");
      return { status: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getYearlyRevenue(id: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    dataYearly?: { _id: number; totalRevenue: number }[];
    dataMonthly?: {
      month: string;
      totalRevenue: number;
    }[];
    weeklyCount?: { appointmentsCount: number; cancellationsCount: number };
    monthlyCount?: { appointmentsCount: number; cancellationsCount: number };
  }> {
    try {
      const result = await this.Repository.getYearlyRevenue(id);
      const monthlyRevenue = await this.Repository.getMonthlyRevenue(id);
      const weeklyAppointmentCount =
        await this.Repository.getWeeklyAppointmentCount(id);
      const monthlyAppointmentCount =
        await this.Repository.getMonthlyAppointmentCount(id);

      return {
        status: true,
        message: "success",
        dataYearly: result,
        dataMonthly: monthlyRevenue,
        weeklyCount: weeklyAppointmentCount,
        monthlyCount: monthlyAppointmentCount,
      };
    } catch (error) {
      throw error;
    }
  }
}
export default DoctorUtilityInteractor