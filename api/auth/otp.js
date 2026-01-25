const nodemailer = require('nodemailer');

// In-memory storage for OTPs (in production, use a database)
const otpStorage = new Map();

// Clean expired OTPs
const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiry) {
      otpStorage.delete(email);
    }
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, action } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Clean expired OTPs
    cleanExpiredOTPs();

    if (action === 'send') {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Store OTP with expiry
      otpStorage.set(email, { otp, expiry });

      // Create transporter
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Advocate-Client Platform - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Email Verification</h2>
            <p>Your OTP for email verification is:</p>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2c3e50; font-size: 2em; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully' 
      });

    } else if (action === 'verify') {
      const { otp } = req.body;

      if (!otp) {
        return res.status(400).json({ error: 'OTP is required' });
      }

      const storedData = otpStorage.get(email);

      if (!storedData) {
        return res.status(400).json({ error: 'OTP not found or expired' });
      }

      if (Date.now() > storedData.expiry) {
        otpStorage.delete(email);
        return res.status(400).json({ error: 'OTP expired' });
      }

      if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // OTP verified, remove from storage
      otpStorage.delete(email);

      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('OTP API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}