import jwt,{JwtPayload} from "jsonwebtoken"
import { Request,Response,NextFunction } from "express"
import { Types } from "mongoose"
export interface CustomJwtPayload extends JwtPayload {
 emailId: string;
  role: string;
  verified:boolean;
  userId:Types.ObjectId
}


export interface CustomRequest extends Request {
  user?: string | CustomJwtPayload;
}


export const verifyToken = (token: string, type: "access" | "refresh") => {
  try {
    return jwt.verify(
      token,
      type === "access"
        ? (process.env.ACCESS_TOKEN_SECRET as string)
        : (process.env.REFRESH_TOKEN_SECRET as string)
    ) as CustomJwtPayload;
  } catch (error) {
    console.log("token error",error)
    return null;
  }
};
const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
const accessToken = req.cookies.accessToken;

if (!accessToken) return res.status(401).json({ message: "No token provided" });
const decodedAccessToken = verifyToken(accessToken, "access");
if (decodedAccessToken) {
  (req as CustomRequest).user = decodedAccessToken;
  return next();
}

const refreshToken = req.cookies.refreshToken;
console.log("refreshToken", refreshToken);
if (!refreshToken)
  return res.status(401).json({ message: "No token provided" });
const decodedRefreshToken = verifyToken(refreshToken, "refresh");
if (decodedRefreshToken) {
  const { userId, email, verified,role } = decodedRefreshToken as CustomJwtPayload;
  const newAccessToken = jwt.sign(
    { userId, email, verified,role },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "1h" }
  );
  (req as CustomRequest).user = decodedRefreshToken;
  res.cookie("accessToken", newAccessToken, {
    path: "/",
    httpOnly: true,
    maxAge:3600
  });
  return next();
}
res.clearCookie("refreshToken");
res.clearCookie("accessToken");
res.status(401).json({ message: "Session expired, please log in again" });
}
export default authMiddleware