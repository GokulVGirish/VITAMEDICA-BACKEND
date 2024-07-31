import dotenv from 'dotenv';
dotenv.config()

export interface IMailer{

    sendMail(email:string): Promise<{ otp: string, success: boolean }>;
    sendPasswordResetLink(email: string): Promise<{success:boolean}>;

}

 interface MailerConfig{
    user:string,
    pass:string
}

export const Mailer = <MailerConfig>{
    user:process.env.MAILER_USER,
    pass:process.env.MAILER_PASS,
}