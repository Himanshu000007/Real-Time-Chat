import { transporter } from "../lib/gmail.js";
import { ENV } from "../lib/env.js";
import { createWelcomeEmailTemplate, createOTPEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const mailOptions = {
      from: `"Chatify" <${ENV.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw for welcome email to avoid blocking signup entirely
  }
};

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Chatify" <${ENV.GMAIL_USER}>`,
      to: email,
      subject: "Your Chatify OTP",
      html: createOTPEmailTemplate(otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
