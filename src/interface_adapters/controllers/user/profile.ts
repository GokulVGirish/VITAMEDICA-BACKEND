import userDataRequest from "../../../frameworks/express/middlewares/user";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { MulterFile } from "../../../entities/rules/multerFile";
import IUserProfileInteractor from "../../../entities/iuse_cases/user/iProfile";




class UserProfileControllers {

  constructor(private readonly interactor: IUserProfileInteractor) {}

  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.interactor.getProfile(
        (req as userDataRequest).userData.image as string
      );

      (req as userDataRequest).userData.password = "*******";
      (req as userDataRequest).userData.image = response.url;

      res
        .status(200)
        .json({ success: true, userData: (req as userDataRequest).userData });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async profileUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as userDataRequest).userData._id;
      const email = (req as userDataRequest).userData.email;

      const user: any = {
        name: req.body.name,
        phone: req.body.phone,
        dob: req.body.dob,
        gender: req.body.gender,
        address: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          postalCode: req.body.zip,
        },
        bloodGroup: req.body.bloodGroup,
      };
      console.log("userdata", user);

      const response = await this.interactor.profileUpdate(
        user,
        userId as Types.ObjectId,
        email
      );
      if (response.status) {
        res.status(200).json({
          success: true,
          message: response.message,
          data: response.data,
        });
      } else {
        res.status(500).json({
          success: true,
          message: response.message,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async ProfilePictureUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as userDataRequest).userData._id;
      const response = await this.interactor.updateProfileImage(
        userId as Types.ObjectId,
        req.file as MulterFile
      );
      if (response.status) {
        res.status(200).json({ success: true, imageData: response.imageData });
      } else {
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async passwordResetLink(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      const response = await this.interactor.passwordResetLink(email);
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
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;
      const password = req.body.password;
      const response = await this.interactor.resetPassword(token, password);
      if (response.status) {
        res.status(200).json({ success: true, message: response.message });
      } else {
        res.status(500).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log(error);
  next(error)
    }
  }

}
export default UserProfileControllers