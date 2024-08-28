import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import { IJwtService } from "../../entities/services/jwtServices";
import bcrypt from "bcryptjs";


class AdminAuthInteractor {
  constructor(
    private readonly repository: IAdminRepository,
    private readonly JwtServices: IJwtService
  ) {}

  async adminLogin(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    adminAccessToken?: string;
    adminRefreshToken?: string;
    message: string;
  }> {
    try {
      const adminExist = await this.repository.getAdmin(email);
      if (adminExist) {
        const hashedPassword = adminExist.password;
        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
          const adminAccessToken = this.JwtServices.generateToken(
            { emailId: adminExist.email, verified: true, role: "admin" },
            { expiresIn: "1h" }
          );
          const adminRefreshToken = this.JwtServices.generateRefreshToken(
            { emailId: adminExist.email, verified: true, role: "admin" },
            { expiresIn: "1d" }
          );
          return {
            status: true,
            adminAccessToken,
            adminRefreshToken,
            message: "logged in sucessfully",
          };
        } else {
          return { status: false, message: "incorrect password" };
        }
      } else {
        return {
          status: false,
          message: "Admin not found",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export default AdminAuthInteractor