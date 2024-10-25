"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetEmailTemplate = exports.otpEmailTemplate = exports.appointmentRemainder = void 0;
const appointmentRemainder = (appointmentId, recipientName, consumerName, appointmentDate, appointmentTime, to) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #081f36;
          padding: 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .body {
          padding: 20px;
        }
        .body h2 {
          color: #081f36;
        }
        .body p {
          line-height: 1.6;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 10px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
        .btn {
          display: inline-block;
          background-color: #333333;
          color: #f4f4f4;
          padding: 10px 20px;
          margin-top: 10px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
        </div>
        <div class="body">
          <h2>Hello, ${to === "doctor" ? "Dr. " : ""}${recipientName}</h2>
          <p>We wanted to remind you of your upcoming appointment scheduled in 2 hours. Below are the details:</p>
          
          <p><strong>Appointment Details:</strong></p>
          <p>
            ${to === "doctor"
        ? `Patient: ${consumerName}`
        : `Doctor: Dr. ${consumerName}`}<br>
            Date: ${appointmentDate}<br>
            Time: ${appointmentTime}
          </p>
          
          <p>Please be on time and feel free to reach out if you have any questions or concerns.</p>
          
          <a href="${to === "user"
        ? process.env.cors_origin +
            `/profile/appointmentDetail/${appointmentId}`
        : process.env.cors_origin + `/doctor/userProfile/${appointmentId}`}" class="btn">View Appointment Details</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VitaMedica. All rights reserved.</p>
          <p>If you have any questions, feel free to <a href="mailto:support@vitamedica.com">contact us</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
exports.appointmentRemainder = appointmentRemainder;
const otpEmailTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #081f36;
          padding: 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color:#ffffff;
        }
        .body {
          padding: 20px;
        }
        .body h2 {
          color: #081f36;
        }
        .body p {
          line-height: 1.6;
        }
        .otp {
          display: inline-block;
          background-color: #081f36;
          color: #ffffff;
          font-size: 20px;
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 10px;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 10px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OTP Verification</h1>
        </div>
        <div class="body">
          <h2>Hello,</h2>
          <p>We have received a request to verify your email. Please use the following One-Time Password (OTP) to complete the process:</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VitaMedica. All rights reserved.</p>
          <p>If you have any questions, feel free to <a href="mailto:support@vitamedica.com">contact us</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
exports.otpEmailTemplate = otpEmailTemplate;
const passwordResetEmailTemplate = (resetLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #081f36;
          padding: 20px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .body {
          padding: 20px;
        }
        .body h2 {
          color: #081f36;
        }
        .body p {
          line-height: 1.6;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 10px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
        .btn {
          display: inline-block;
          background-color: #333333;
          color: #ffffff;
          padding: 10px 20px;
          margin-top: 10px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="body">
          <h2>Hello, User</h2>
          <p>We received a request to reset your password. Please click the button below to reset your password:</p>
          <a href="${resetLink}" class="btn">Reset Password</a>
          <p>If you did not request this password reset, please ignore this email. The reset link is valid for 30 minutes.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VitaMedica. All rights reserved.</p>
          <p>If you have any questions, feel free to <a href="mailto:support@vitamedica.com">contact us</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
exports.passwordResetEmailTemplate = passwordResetEmailTemplate;
exports.default = exports.passwordResetEmailTemplate;
