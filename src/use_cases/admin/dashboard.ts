import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminDashboardInteractor from "../../entities/iuse_cases/admin/iDashboard";


class AdminDashboardInteractor implements IAdminDashboardInteractor {
  constructor(
    private readonly repository: IAdminRepository
  ) {}
  async getCurrentDayReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: number;
    unverifiedDocs: number;
    doctors: number;
    users: number;
  }> {
    try {
      const revenue = await this.repository.getTodaysRevenue();
      const appointCount = await this.repository.getTodaysAppointmentCount();
      const unverifiedDoctors =
        await this.repository.getUnverifiedDoctorsCount();
      const users = await this.repository.getUsersCount();
      const doctors = await this.repository.getDoctorsCount();

      return {
        success: true,
        message: "success",
        revenue,
        count: appointCount,
        unverifiedDocs: unverifiedDoctors,
        doctors,
        users,
      };
    } catch (error) {
      throw error;
    }
  }
  async getWeeklyReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
  }> {
    try {
      const revenue = await this.repository.getWeeklyRevenue();
      const appointCount = await this.repository.getWeeklyAppointmentCount();
      return {
        success: true,
        message: "success",
        revenue: revenue,
        count: appointCount,
      };
    } catch (error) {
      throw error;
    }
  }
  async getMonthlyReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
  }> {
    try {
      const revenue = await this.repository.getMonthlyRevenue();
      const appointCount = await this.repository.getMonthlyAppointmentCount();
      return {
        success: true,
        message: "success",
        revenue: revenue,
        count: appointCount,
      };
    } catch (error) {
      throw error;
    }
  }
  async getYearlyReport(): Promise<{
    success: boolean;
    message: string;
    revenue?: { label: string; totalRevenue: number }[];
  }> {
    try {
      const revenue = await this.repository.getYearlyRevenue();
      return {
        success: true,
        message: "success",
        revenue: revenue,
      };
    } catch (error) {
      throw error;
    }
  }
}
export default AdminDashboardInteractor