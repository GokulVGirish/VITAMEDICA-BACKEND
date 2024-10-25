import { Mailer } from "../../entities/services/mailer";
import passwordResetEmailTemplate, { otpEmailTemplate } from "./emailContent";
const nodemailer = require("nodemailer");
const sendMail = async (
  email: string,
  content: string,
  type: "otp" | "link" | "notification"
): Promise<{ success: boolean }> => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: Mailer.user,
      pass: Mailer.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  let subject, text;
  if (type == "otp") {
    subject = "Signup Verification Mail from VitaMedica";
    text = otpEmailTemplate(content);
  } else if (type === "notification") {
    subject = `Health Appointment`;
    text = content;
  } else {
    subject = "Password Reset Request";
    text = passwordResetEmailTemplate(content);
  }

  const mailOptions = {
    from: Mailer.user,
    to: email,
    subject: subject,
    html: text,
  };
  try {
    const response = await transporter.sendMail(mailOptions);
    console.log("Email sent:", response.response);
    return { success: true };
  } catch (error) {
    console.log("error sending email");
    return { success: false };
  }
};
export default sendMail;
