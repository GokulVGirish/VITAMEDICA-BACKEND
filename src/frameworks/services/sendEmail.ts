import { Mailer } from "../../entities/services/mailer"
const nodemailer=require("nodemailer")
const sendMail=async(email:string,content:string,type:"otp"|"link"):Promise<{success:boolean}>=>{
  
   const transporter= nodemailer.createTransport({
          service: 'Gmail',
        auth: {
            user: Mailer.user,
            pass: Mailer.pass,
        },
        tls: {
            rejectUnauthorized: false,
        }
    })
    let subject,text
    if(type=="otp"){
         subject = 'Signup Verification Mail from VitaMedica';
        text = `Your OTP is ${content}. Use this OTP to complete your signup process.`;
    }else{
         subject = 'Password Reset Request';
        text = `Click on the following link to reset your password: ${content}`;
    }

    const mailOptions = {
        from: Mailer.user,
        to: email,
        subject: subject,
        text: text,
    };
    try{
       
        const response=await transporter.sendMail(mailOptions)
        console.log('Email sent:', response.response);
        return { success: true };
    }
    catch(error){
        console.log("error sending email")
        return {success:false}
        
    }

}
export default sendMail