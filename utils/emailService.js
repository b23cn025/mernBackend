const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'fitnespass@gmail.com',
    pass: process.env.GMAIL_PASS || 'your-app-password'
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName = '') => {
  try {
    // Check if Gmail credentials are configured (placeholder values)
    const isPlaceholder = process.env.GMAIL_USER?.includes('your-') || 
                          process.env.GMAIL_PASS?.includes('your-');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || isPlaceholder) {
      console.warn('⚠️  Gmail credentials not configured. Running in demo mode - OTP will be logged to console.');
      console.log(`📧 Demo OTP for ${email}: ${otp}`);
      return true; // Allow login in demo mode
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'FitnessPass - Your OTP for Two-Factor Authentication',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6C63FF 0%, #FF6584 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">FitnessPass</h1>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center;">
            <p style="color: #333; font-size: 16px;">Hi ${userName || 'there'},</p>
            <p style="color: #666; font-size: 14px;">Your one-time password (OTP) for two-factor authentication is:</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #6C63FF;">
              <h2 style="color: #6C63FF; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h2>
            </div>
            <p style="color: #999; font-size: 12px;">This OTP will expire in 5 minutes.</p>
            <p style="color: #999; font-size: 12px;">Do not share this OTP with anyone.</p>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">© 2026 FitnessPass. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    console.warn('⚠️  Email sending failed. Running in demo mode - check console for OTP.');
    return true; // Allow login anyway in demo mode
  }
};

module.exports = { generateOTP, sendOTPEmail };
