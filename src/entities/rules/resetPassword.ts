import { JwtPayload } from "jsonwebtoken";

export interface ResetPasswordToken extends JwtPayload {
  email:string;
  resetTokenExpiry:Date;
}
