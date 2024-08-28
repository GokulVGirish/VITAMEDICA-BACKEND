

interface IAdminAuthInteractor {
  adminLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    adminAccessToken?: string;
    adminRefreshToken?: string;
    message: string;
  }>;
}
export default IAdminAuthInteractor