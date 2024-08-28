import IAdminRepository from "../../entities/irepositories/iAdminRepository";
import IAdminDepartmentInteractor from "../../entities/iuse_cases/admin/iDepartment";
import MongoDepartment from "../../entities/rules/departments";


class AdminDepartmentInteractor implements IAdminDepartmentInteractor {
  constructor(private readonly repository: IAdminRepository) {}
  async getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }> {
    try {
      const response = await this.repository.getDepartments();
      if (response.status) {
        return { status: true, departments: response.departments };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async addDepartment(name: string): Promise<{
    status: boolean;
    department?: MongoDepartment;
    message?: string;
  }> {
    try {
      const data = await this.repository.getDepartments();
      const exists = data.departments?.find(
        (dep) => dep.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        return { status: false, message: "Department already exist" };
      }
      const response = await this.repository.addDepartment(name);
      if (response.status) {
        return {
          status: true,
          department: response.department,
        };
      } else {
        return {
          status: false,
          message: "internal server error",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteDepartment(
    id: string
  ): Promise<{ status: boolean; message?: string }> {
    try {
      const response = await this.repository.deleteDepartment(id);
      if (response.status) {
        return { status: true, message: response.message };
      } else {
        return { status: true, message: response.message };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export default AdminDepartmentInteractor