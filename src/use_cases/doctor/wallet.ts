import { Types } from "mongoose";
import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import IDoctorWalletInteractor from "../../entities/iuse_cases/doctor/iwallet";
import { IDoctorWallet } from "../../entities/rules/doctorWalletType";



class DoctorWalletInteractor implements IDoctorWalletInteractor {
  constructor(private readonly Repository: IDoctorRepository) {}
  async getWalletDetails(
    page: number,
    limit: number,
    docId: Types.ObjectId
  ): Promise<{
    status: boolean;
    doctorWallet?: IDoctorWallet;
    message: string;
    totalPages?: number;
  }> {
    try {
      const response = await this.Repository.getWalletDetails(
        page,
        limit,
        docId
      );
      if (!response.status)
        return { status: false, message: "No wallet Found" };
      return {
        status: true,
        message: "Sucessful",
        doctorWallet: response.doctorWallet,
        totalPages: response.totalPages,
      };
    } catch (error) {
      throw error;
    }
  }
  async withdrawFromWallet(docId: Types.ObjectId, amount: string): Promise<boolean> {
      try{
        const response=await this.Repository.doctorWalletUpdate(docId,amount,"withdraw","withdrawal done")
        const withdrawalRedord=await this.Repository.withdrawalRecord(docId,amount)
        if(response && withdrawalRedord) return true
        return false
        

      }
      catch(error){
        throw error
      }
  }
}
export default DoctorWalletInteractor