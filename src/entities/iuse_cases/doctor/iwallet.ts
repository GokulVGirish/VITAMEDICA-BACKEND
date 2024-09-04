import mongoose, { Types } from "mongoose";
import { IDoctorWallet } from "../../rules/doctorWalletType";



interface IDoctorWalletInteractor {
  getWalletDetails(
    page: number,
    limit: number,
    docId: Types.ObjectId
  ): Promise<{
    status: boolean;
    doctorWallet?: IDoctorWallet;
    message: string;
    totalPages?: number;
  }>;
  withdrawFromWallet(docId:mongoose.Types.ObjectId,amount:string):Promise<boolean>
}
export default IDoctorWalletInteractor