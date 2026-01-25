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

exports.handler = async (event, context) => {
  // Enable CORS for all origins
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, action, otp } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Clean expired OTPs
    cleanExpiredOTPs();

    if (action === 'send') {
      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Email service not configured' })
        };
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Store OTP with expiry
      otpStorage.set(email, { otp: otpCode, expiry });

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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3498db; margin: 0;">⚖️ Advocate-Client Platform</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Email Verification</h2>
              <p style="font-size: 16px; color: #555; margin-bottom: 30px;">Your verification code is:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #3498db; margin: 20px 0;">
                <h1 style="color: #2c3e50; font-size: 2.5em; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
              </div>
              <p style="color: #e74c3c; font-weight: bold;">This code expires in 5 minutes</p>
              <p style="color: #777; font-size: 14px; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
            </div>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully' 
        })
      };

    } else if (action === 'verify') {
      if (!otp) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'OTP is required' })
        };
      }

      const storedData = otpStorage.get(email);

      if (!storedData) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'OTP not found or expired' })
        };
      }

      if (Date.now() > storedData.expiry) {
        otpStorage.delete(email);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'OTP expired' })
        };
      }

      if (storedData.otp !== otp) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid OTP' })
        };
      }

      // OTP verified, remove from storage
      otpStorage.delete(email);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'OTP verified successfully' 
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('OTP API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};