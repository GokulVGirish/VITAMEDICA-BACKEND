

interface IAdminDashboardInteractor {
  getCurrentDayReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: number;
    unverifiedDocs: number;
    doctors: number;
    users: number;
    todaysRefunds: any;
    todaysWithdrawals: any;
  }>;
  getWeeklyReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
    refunds: any;
    withdrawals: any;
  }>;
  getMonthlyReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
    refunds: any;
    withdrawals: any;
  }>;
  getYearlyReport(): Promise<{
    success: boolean;
    message: string;
    revenue?: { label: string; totalRevenue: number }[];
    refunds: any;
    withdrawals: any;
  }>;
}
export default IAdminDashboardInteractor