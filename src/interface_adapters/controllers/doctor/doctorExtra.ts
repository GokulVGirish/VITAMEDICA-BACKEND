import { IDoctorInteractor } from "../../../entities/iuse_cases/iDoctorInteractor";
import { Request, Response, NextFunction } from "express";
import { doctorDataRequest } from "../../../frameworks/express/middlewares/doctor";


class DoctorExtraControllers {
  constructor(private readonly interactor: IDoctorInteractor) {}
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
  async uploadDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("files", req.files);
      let files: Express.Multer.File[] = [];

      if (Array.isArray(req.files)) {
        files = req.files as Express.Multer.File[];
      } else if (req.files && typeof req.files === "object") {
        files = Object.values(req.files).flat() as Express.Multer.File[];
      }

      if (files.length !== 4) {
        return res
          .status(400)
          .json({ status: false, message: "Exactly 4 images are required" });
      }
      const [file1, file2, file3, file4] = files;
      const docId = (req as doctorDataRequest).doctorData._id.toString();
      const response = await this.interactor.documentsUpload(
        docId,
        file1,
        file2,
        file3,
        file4
      );
      if (response.status) {
        res.status(200).json({ message: "success", status: "Submitted" });
      } else {
        res.status(500).json({ message: "failed" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default DoctorExtraControllers