import { Request,Response,NextFunction } from "express"
export interface CustomRequestType extends Request{
   user:{
     emailId?:string;
    role?:string;
    verified:boolean
   }
}

const verifyRole=(theRole:string)=>{

    return (req:Request,res:Response,next:NextFunction)=>{
      
        const {role,verified}=(req as CustomRequestType).user
          console.log("user",(req as CustomRequestType).user)
        if(theRole===role){
           if(verified)return next()
            else return res.status(403).json({message:"not yet verified"})
        }else{
           return res.status(403).json({ message: 'Access denied' });
        }

    }

   
}
export default verifyRole