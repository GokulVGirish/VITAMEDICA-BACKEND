import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminDoctorManagementInteractor from "../../entities/iuse_cases/admin/iDoctorManagement";
import { MongoDoctor } from "../../entities/rules/doctor";
import { IawsS3 } from "../../entities/services/awsS3";
import { io } from "../../frameworks/express/app";


class AdminDoctorManagementInteractor
  implements IAdminDoctorManagementInteractor
{
  constructor(private readonly repository: IAdminRepository,private readonly AwsS3:IawsS3) {}
  async getUnverifiedDoctors(): Promise<{
    status: boolean;
    doctors?: MongoDoctor[];
  }> {
    try {
      const response = await this.repository.getUnverifiedDoctors();
      if (response.status) {
        return { status: true, doctors: response.doctors };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getDoctorDocs(
    id: string
  ): Promise<{ status: boolean; doctor?: MongoDoctor }> {
    try {
      const result = await this.repository.getDoctor(id);
      if (!result.status) {
        return { status: false };
      }
      const doctor = result.doctor;
      if (!doctor || !doctor.documents) {
        return { status: false };
      }

      const command1 = this.AwsS3.getObjectCommandS3(
        doctor.documents.certificateImage!
      );
   

      const command2 = this.AwsS3.getObjectCommandS3(
        doctor.documents.qualificationImage!
      );
    

      const command3 = this.AwsS3.getObjectCommandS3(
    doctor.documents.aadarFrontImage!
      );
   

      const command4 = this.AwsS3.getObjectCommandS3(
    doctor.documents.aadarBackImage!
      );
     
     const certificateImage= await this.AwsS3.getSignedUrlS3(command1,3600)
         
      const qualificationImage =  await this.AwsS3.getSignedUrlS3(
        command2,
        3600
      );
      
      const aadarFrontImage = await this.AwsS3.getSignedUrlS3(command3, 3600);
       
      const aadarBackImage = await this.AwsS3.getSignedUrlS3(command4,3600)



      doctor.documents.certificateImage = certificateImage;
      doctor.documents.qualificationImage = qualificationImage;
      doctor.documents.aadarFrontImage = aadarFrontImage;
      doctor.documents.aadarBackImage = aadarBackImage;
      return { status: true, doctor: doctor };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async verifyDoctor(id: string): Promise<boolean> {
    try {
      const result = await this.repository.verifyDoctor(id);

      io.to(id).emit("doctorVerified");
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getDoctors(): Promise<{ status: boolean; doctors?: MongoDoctor[] }> {
    try {
      const response = await this.repository.getDoctors();
      if (response.status) {
        return { status: true, doctors: response.doctors };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async blockUnblockDoctor(
    id: string,
    status: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      let changedStatus;
      if (status === "true") {
        changedStatus = false;
      } else {
        changedStatus = true;
      }
      const response = await this.repository.blockUnblockDoctor(
        id,
        changedStatus
      );
      if (!response) {
        return { status: false, message: "internal server error" };
      }
      if (changedStatus) {
        io.to(id).emit("blocked", "doctor");
      }
      return {
        status: true,
        message: `user has been sucessfully ${
          changedStatus ? "Blocked" : "Unblocked"
        }`,
      };
    } catch (error) {
      throw error;
    }
  }
  async rejectDoctor(
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.repository.getDoctor(id);
      if (!result.status)
        return { success: false, message: "Doctor Not Found" };
      const doctor = result.doctor;
      await this.AwsS3.deleteObjectCommandS3(
        doctor?.documents?.certificateImage as string
      );
      await this.AwsS3.deleteObjectCommandS3(
        doctor?.documents?.qualificationImage as string
      );
      await this.AwsS3.deleteObjectCommandS3(
        doctor?.documents?.aadarFrontImage as string
      );
      await this.AwsS3.deleteObjectCommandS3(
        doctor?.documents?.aadarFrontImage as string
      );
      await this.repository.deleteDoctor(id);
      const response = await this.repository.createRejectedDoctor(
        doctor?.email as string,
        reason
      );
      if (!response)
        return { success: false, message: "Internal server error" };
      return { success: true, message: "Rejected Sucessfully" };
    } catch (error) {
      throw error;
    }
  }
  async getDoctorProfile(id: string, page: number, limit: number): Promise<{ status: boolean; message: string; data?: MongoDoctor; }> {
      try{
        const result=await this.repository.getDoctorProfile(id,page,limit)
        if(result.image){
          const command=this.AwsS3.getObjectCommandS3(result.image)
          const url=await this.AwsS3.getSignedUrlS3(command,3600)
          result.image=url
        }
        if(result.documents){
          const command1 = this.AwsS3.getObjectCommandS3(
            result.documents?.certificateImage!
          );
          const command2 = this.AwsS3.getObjectCommandS3(
            result.documents?.qualificationImage!
          );
          const command3 = this.AwsS3.getObjectCommandS3(
            result.documents?.aadarFrontImage!
          );
          const command4 = this.AwsS3.getObjectCommandS3(
            result.documents?.aadarBackImage!
          );
          const url1 = await this.AwsS3.getSignedUrlS3(command1, 3600);
          const url2 = await this.AwsS3.getSignedUrlS3(command2, 3600);
          const url3 = await this.AwsS3.getSignedUrlS3(command3, 3600);
          const url4 = await this.AwsS3.getSignedUrlS3(command4, 3600);
          result.documents.certificateImage = url1;
          result.documents.qualificationImage = url2;
          result.documents.aadarFrontImage = url3;
          result.documents.aadarBackImage = url4;
        }

          if (result) return { status: true, message: "success", data: result };
          return {status:false,message:"Internal Server Error"}
  
      }
      catch(error){
        throw error
      }
  }
}
export default AdminDoctorManagementInteractor