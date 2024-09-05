import { Types } from "mongoose";
import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminPayoutsInteractor from "../../entities/iuse_cases/admin/iPayouts";
import { IawsS3 } from "../../entities/services/awsS3";


class AdminPayoutsInteractor implements IAdminPayoutsInteractor {
  constructor(private readonly Repository: IAdminRepository,private readonly AwsS3:IawsS3) {}
  async getRefundsList(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<{
    status: boolean;
    message: string;
    refundList?: {
      _id: Types.ObjectId;
      date: Date;
      userName: string;
      cancelledBy: string;
      amount: string;
    }[];
    count?: number;
  }> {
    try {
      const response = await this.Repository.getRefundsList(
        page,
        limit,
        startDate,
        endDate
      );
      if (!response) return { status: false, message: "Couldnt Find Data" };
      if (response.RefundList.length > 0)
        return {
          status: true,
          message: "sucess",
          refundList: response.RefundList,
          count: response.count,
        };
      return { status: false, message: "Do Data Found" };
    } catch (error) {
      throw error;
    }
  }
  async getWithdrawalList(
    page: number,
    limit: number,
    startDate: string,
    endDate: string
  ): Promise<{
    status: boolean;
    message: string;
    withdrawalList?: {
      name: string;
      date: Date;
      email: string;
      amount: number;
    }[];
    count?: number;
  }> {
    try {
      const response = await this.Repository.getWithdrawalList(
        page,
        limit,
        startDate,
        endDate
      );
      if (!response) return { status: false, message: "Couldnt fetch" };
      if (response.withdrawalList && response.withdrawalList?.length > 0)
        return {
          status: true,
          message: "Success",
          withdrawalList: response.withdrawalList,
          count: response.count,
        };

      return { status: false, message: "Couldnt fetch" };
    } catch (error) {
      throw error;
    }
  }
  async getRefundDetail(
    id: string
  ): Promise<{
    status: boolean;
    message: string;
    refundDetail?: {
      _id: Types.ObjectId;
      docName: string;
      userName: string;
      docImg: string;
      userImg: string;
      cancelledBy: string;
      appointmentTime: Date;
      appointmentBookedTime: Date;
      reason: string;
      amount: string;
      cancellationTime: Date;
    };
  }> {
    try {
      const response = await this.Repository.getRefundDetail(id);
      if(response) {
        if(response.docImg){
            const command=this.AwsS3.getObjectCommandS3(response.docImg)
            const url=await this.AwsS3.getSignedUrlS3(command,3600)
            response.docImg=url
        }
        if(response.userImg){
            const command = this.AwsS3.getObjectCommandS3(response.userImg);
            const url = await this.AwsS3.getSignedUrlS3(command, 3600);
            response.userImg = url;

        }
        return { status: true, message: "Success", refundDetail: response };
      }
      return {status:false,message:"Something went wrong"}

    } catch (error) {
      throw error;
    }
  }
}
export default AdminPayoutsInteractor