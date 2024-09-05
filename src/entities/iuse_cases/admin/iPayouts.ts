import { Types } from "mongoose"
interface IAdminPayoutsInteractor {
  getRefundsList(
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
  }>;
  getRefundDetail(id: string): Promise<{
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
  }>;
  getWithdrawalList(
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
  }>;
}
export default IAdminPayoutsInteractor