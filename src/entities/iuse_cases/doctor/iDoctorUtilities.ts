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
  getTodaysRevenue(id: Types.ObjectId): Promise<{
    status: boolean;
    message: string;
    data?: {
      revenue: number;
      count?: { appointmentsCount: number; cancellationsCount: number };
    };
  }>;
  getWeeklyReport(id: Types.ObjectId): Promise<{
    success: boolean;
    message: string;
    data?: {
      count?: { appointmentsCount: number; cancellationsCount: number };
      revenue?: { label: string; totalRevenue: number }[];
    };
  }>;
  getMonthlyReport(id: Types.ObjectId): Promise<{
    success: boolean;
    message: string;
    data?: {
      count?: { appointmentsCount: number; cancellationsCount: number };
      revenue?: { label: string; totalRevenue: number }[];
    };
  }>;
  getYearlyReport(id: Types.ObjectId): Promise<{
    success: boolean;
    message: string;
    data?: {
      count?: { appointmentsCount: number; cancellationsCount: number };
      revenue?: { label: number; totalRevenue: number }[];
    };
  }>;
}
export default IDoctorUtilityInteractor