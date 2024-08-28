import IAdminDepartmentInteractor from "../../../entities/iuse_cases/admin/iDepartment";
import { Request, Response, NextFunction } from "express";


class AdminDepartmentControllers {
  constructor(private readonly interactor: IAdminDepartmentInteractor) {}
  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.interactor.getDepartments();
      if (response.status) {
        res
          .status(200)
          .json({ success: true, departments: response.departments });
      } else {
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async addDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentName = req.body.department;
      console.log("body", req.body);
      const response = await this.interactor.addDepartment(departmentName);
      if (response.status) {
        res
          .status(200)
          .json({
            success: true,
            department: response.department,
            message: "Department added",
          });
      } else {
        res.status(500).json({
          success: false,
          message: response.message,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const response = await this.interactor.deleteDepartment(id);
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default AdminDepartmentControllers