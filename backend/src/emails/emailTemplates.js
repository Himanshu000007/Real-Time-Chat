export function createWelcomeEmailTemplate(name, clientURL) {
  // ... (unchanged)
}

export function createOTPEmailTemplate(otp) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Email Verification</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello,</strong></p>
      <p>Thank you for signing up for Chatify! Please use the following One-Time Password (OTP) to verify your email address. This code will expire in 5 minutes.</p>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC; text-align: center;">
        <h1 style="font-size: 48px; letter-spacing: 10px; margin: 0; color: #333;">${otp}</h1>
      </div>
      
      <p style="margin-bottom: 5px;">If you didn't request this code, you can safely ignore this email.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Chatify Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Chatify. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
}
