import { response } from "express";
import { IMailer } from "../../entities/services/mailer";
import { generateRandomOTP } from "./generateOtp";
import sendMail from "./sendEmail";

class Mailer implements IMailer{
    async sendMail(email: string): Promise<{ otp: string; success: boolean; }> {
        const otp=generateRandomOTP(4)
        const response=await sendMail(email,otp,"otp")
        console.log("otp is",otp)
      return {otp:otp,success:response.success}
      
        
    }
    async sendPasswordResetLink(email: string): Promise<{ success: boolean; }> {
         const link = `http://localhost:5173/reset-password/`;
         const response= await sendMail(email,link,"link")
         return {success:response.success}
        
    }

}
export default Mailer