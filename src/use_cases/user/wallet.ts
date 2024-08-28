import { Types } from "mongoose";
import IUserRepository from "../../entities/irepositories/iuserRepository";
import IUserWalletInteractor from "../../entities/iuse_cases/user/iWallet";
import IUserWallet from "../../entities/rules/userWalletType";


class UserWalletInteractor implements IUserWalletInteractor {
  constructor(private readonly Repository: IUserRepository) {}
  async getWalletInfo(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    userWallet?: IUserWallet;
    message: string;
    totalPages?: number;
  }> {
    try {
      const response = await this.Repository.userWalletInfo(
        page,
        limit,
        userId
      );
      if (!response.status)
        return { status: false, message: "No wallet Found" };
      return {
        status: true,
        message: "Sucessful",
        userWallet: response.userWallet,
        totalPages: response.totalPages,
      };
    } catch (error) {
      throw error;
    }
  }
}
export default UserWalletInteractor