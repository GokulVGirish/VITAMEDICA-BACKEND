import jwt,{JwtPayload} from "jsonwebtoken"
import { Request,Response,NextFunction } from "express"
interface CustomJwtPayload extends JwtPayload {
 emailId: string;
  role: string;
  verified:boolean;
}


export interface CustomRequest extends Request {
  user?: string | CustomJwtPayload;
}


const verifyAccessToken=(token:string)=>{

    try{
        return jwt.verify(token,process.env.ACCESS_TOCKEN_SECRET as string)as CustomJwtPayload

    }
    catch(error){
        return null

    }
}
const verifyRefreshToken=(token:string)=>{
    try{
        return jwt.verify(token,process.env.REFRESH_TOCKEN_SECRET as string)as CustomJwtPayload

    }
    catch(error){
        return null
    }

}
const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
   const authHeader=req.headers.authorization
   console.log("authheader",authHeader)
   if(!authHeader) return res.status(401).json({message:"No token provided"})
    const [type,token]=authHeader.split(" ")
  if(type!=="Bearer") return res.status(401).json({ message: 'Invalid token type' })
    const decodedToken=verifyAccessToken(token)
  console.log(
    "gf",
    process.env.ACCESS_TOCKEN_SECRET,
    "rwfr",
    process.env.REFRESH_TOCKEN_SECRET
  );
  console.log("ref",req.cookies.refreshToken)
   if(decodedToken){
   (req as CustomRequest).user = decodedToken;
    return next()
   }
   const refreshToken=req.cookies.refreshToken
   if(!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });
   const decodedRefreshToken=verifyRefreshToken(refreshToken)
   if(decodedRefreshToken){
    const {emailId,role,verified}=decodedRefreshToken as CustomJwtPayload

    const newAccessToken=jwt.sign({emailId,role,verified},process.env.ACCESS_TOCKEN_SECRET as string,{expiresIn:"1h"});
    (req as CustomRequest).user=decodedRefreshToken
    res.cookie("accessToken", newAccessToken, {
      path: "/"
    });
    return next()
   }
   res.clearCookie("refreshToken")
   res.status(401).json({ message: 'Session expired, please log in again' });


}
export default authMiddleware