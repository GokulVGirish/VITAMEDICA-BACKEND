import MongoDepartment from "../../rules/departments";


interface IAdminDepartmentInteractor {
  getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }>;
  addDepartment(name: string): Promise<{
    status: boolean;
    department?: MongoDepartment;
    message?: string;
  }>;
  deleteDepartment(id: string): Promise<{ status: boolean; message?: string }>;
}
export default IAdminDepartmentInteractor