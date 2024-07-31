import { NextFunction ,Request,Response} from "express";
interface CustomError extends Error{
    statusCode?:number

}
const hasStatusCode=(error:any):error is CustomError=>{

    return typeof error.statusCode==="number"

}


const errorHandler=(error:Error,req:Request,res:Response,next:NextFunction)=>{
    
    if(hasStatusCode(error)){
          res.status(error.statusCode as number).json({ error: error.message });
    }else{
         res.status(500).json({ error: error.message });

    }

}
export default errorHandler

