import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminDashboardInteractor from "../../entities/iuse_cases/admin/iDashboard";


class AdminDashboardInteractor implements IAdminDashboardInteractor {
  constructor(private readonly repository: IAdminRepository) {}
  async getCurrentDayReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: number;
    unverifiedDocs: number;
    doctors: number;
    users: number;
    todaysRefunds: any;
    todaysWithdrawals: any;
  }> {
    try {
      const revenue = await this.repository.getTodaysRevenue();
      const appointCount = await this.repository.getTodaysAppointmentCount();
      const users = await this.repository.getUsersCount();
      const doctorCounts = await this.repository.getDoctorCount();
      const totalCancellation = await this.repository.getTodaysRefunds();
      const totalWithdrawals = await this.repository.getTodaysWithdrawals();

      return {
        success: true,
        message: "success",
        revenue,
        count: appointCount,
        unverifiedDocs: doctorCounts.unverifiedDoctorCount,
        doctors: doctorCounts.doctorCount,
        users,
        todaysRefunds: totalCancellation,
        todaysWithdrawals: totalWithdrawals,
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
    refunds: any;
    withdrawals: any;
  }> {
    try {
      const revenue = await this.repository.getWeeklyRevenue();
      const appointCount = await this.repository.getWeeklyAppointmentCount();
      const refund = await this.repository.getWeeklyRefunds();
      const withdrawals = await this.repository.getWeeklyWithdrawals();
      return {
        success: true,
        message: "success",
        revenue: revenue,
        count: appointCount,
        refunds: refund,
        withdrawals: withdrawals,
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
    refunds: any;
    withdrawals: any;
  }> {
    try {
      const revenue = await this.repository.getMonthlyRevenue();
      const appointCount = await this.repository.getMonthlyAppointmentCount();
      const refunds = await this.repository.getMonthlyRefunds();
      const withdrawals = await this.repository.getMonthlyWithdrawals();
      return {
        success: true,
        message: "success",
        revenue: revenue,
        count: appointCount,
        refunds: refunds,
        withdrawals: withdrawals,
      };
    } catch (error) {
      throw error;
    }
  }
  async getYearlyReport(): Promise<{
    success: boolean;
    message: string;
    revenue?: { label: string; totalRevenue: number }[];
    refunds: any;
    withdrawals: any;
  }> {
    try {
      const revenue = await this.repository.getYearlyRevenue();
      const refunds = await this.repository.getYearlyRefunds();
      const withdrawal = await this.repository.getYearlyWithdrawals();
      return {
        success: true,
        message: "success",
        revenue: revenue,
        refunds: refunds,
        withdrawals: withdrawal,
      };
    } catch (error) {
      throw error;
    }
  }
}
export default AdminDashboardInteractor