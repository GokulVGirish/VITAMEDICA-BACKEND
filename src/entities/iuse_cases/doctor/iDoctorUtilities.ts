import { Types } from "mongoose";
import MongoDepartment from "../../rules/departments";
import { MulterFile } from "../../rules/multerFile";



interface IDoctorUtilityInteractor {
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  documentsUpload(
    docId: string,
    file1: MulterFile,
    file2: MulterFile,
    file3: MulterFile,
    file4: MulterFile
  ): Promise<{ status: boolean }>;
  getYearlyRevenue(id: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    dataYearly?: { _id: number; totalRevenue: number }[];
    dataMonthly?: {
      month: string;
      totalRevenue: number;
    }[];
    weeklyCount?: { appointmentsCount: number; cancellationsCount: number };
    monthlyCount?: { appointmentsCount: number; cancellationsCount: number };
  }>;
}
export default IDoctorUtilityInteractor