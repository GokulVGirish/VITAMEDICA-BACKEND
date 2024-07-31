import { Request, RequestHandler } from "express";
import userModel from "../../mongoose/models/UserSchema";
import { CustomRequestType } from "./role-Authenticate";
import { User } from "../../../entities/rules/user";
export default interface userDataRequest extends Request {
    userData:User;
}
export const getUser:RequestHandler = async (req,res,next) => {
    try {
        const {emailId} = (req as CustomRequestType).user
        const user = await userModel.findOne({email:emailId })
        if(!user) return res.status(401).json({message:"Un authorized access"})
        if(user.isBlocked) return res.status(401).json({ message: "Sorry User Blocked" });
        (req as userDataRequest).userData = user
        next()
    } catch (e) {
        return res.status(500).json({ message: "Internal server Error" });   
    }
}