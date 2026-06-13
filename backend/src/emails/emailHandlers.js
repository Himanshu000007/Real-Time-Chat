import { Resend } from "resend";
import { ENV } from "../lib/env.js";
import {
  createWelcomeEmailTemplate,
  createOTPEmailTemplate,
} from "../emails/emailTemplates.js";

const resend = new Resend(ENV.RESEND_API_KEY);

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    await resend.emails.send({
      from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const sendOTPEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: "Your Chatify OTP",
      html: createOTPEmailTemplate(otp),
    });

    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};