import { Types } from "mongoose";
import IUserWallet from "../../rules/userWalletType";


interface IUserWalletInteractor {
  getWalletInfo(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    userWallet?: IUserWallet;
    message: string;
    totalPages?: number;
  }>;
}
export default IUserWalletInteractor


