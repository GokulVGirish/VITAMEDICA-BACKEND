

interface IAdminDashboardInteractor {
  getCurrentDayReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: number;
    unverifiedDocs: number;
    doctors: number;
    users: number;
  }>;
  getWeeklyReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
  }>;
  getMonthlyReport(): Promise<{
    success: boolean;
    message: string;
    count?: { appointmentsCount: number; cancellationsCount: number };
    revenue?: { label: string; totalRevenue: number }[];
  }>;
  getYearlyReport(): Promise<{
    success: boolean;
    message: string;
    revenue?: { label: string; totalRevenue: number }[];
  }>;
}
export default IAdminDashboardInteractor