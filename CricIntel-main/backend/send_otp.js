const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/.env' });

/**
 * Nodemailer-based OTP Email Delivery System for CricIntel.
 * 
 * Invoked by Python Django backend or standalone Node processes.
 */
async function sendOtpEmail(email, otp, name = 'User', purpose = 'verification') {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const user = process.env.EMAIL_HOST_USER || '';
  const pass = process.env.EMAIL_HOST_PASSWORD || '';

  let transporter;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    // Development / Fallback transport: uses JSON stream to prevent crashes when SMTP credentials are not configured
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  const title = purpose === 'password-reset' ? 'Password Reset Code' : 'Verification Code';

  const mailOptions = {
    from: '"CricIntel" <noreply@cricintel.com>',
    to: email,
    subject: `CricIntel — Your ${title}`,
    text: `Hello ${name},\n\nYour CricIntel ${title.toLowerCase()} is: ${otp}\n\nThis code expires in 2 minutes.\n\nBest regards,\nThe CricIntel Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #10b981; text-align: center;">CricIntel</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Your ${title.toLowerCase()} for CricIntel is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #e5e7eb; border-radius: 8px; border: 2px dashed #10b981;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in <strong>2 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; CricIntel. All rights reserved.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[NODEMAILER_SUCCESS] OTP sent to ${email} (MessageID: ${info.messageId || 'sent'})`);
    console.log(`[OTP_CODE] ${otp}`);
    return true;
  } catch (error) {
    console.error(`[NODEMAILER_ERROR] Failed to send email to ${email}:`, error.message);
    console.log(`[OTP_CODE_FALLBACK] ${otp}`);
    return false;
  }
}

if (require.main === module) {
  const email = process.argv[2];
  const otp = process.argv[3];
  const name = process.argv[4] || 'User';
  const purpose = process.argv[5] || 'verification';

  if (!email || !otp) {
    console.error('Usage: node send_otp.js <email> <otp> [name] [purpose]');
    process.exit(1);
  }

  sendOtpEmail(email, otp, name, purpose)
    .then(success => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(0);
    });
}

module.exports = { sendOtpEmail };
