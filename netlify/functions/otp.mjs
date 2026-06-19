import nodemailer from 'nodemailer';

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

export const handler = async (event, context) => {
  // Enable CORS for all origins
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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
      // Check if email credentials are configured and not placeholders
      const isEmailConfigured =
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        !process.env.EMAIL_USER.includes('your-gmail') &&
        !process.env.EMAIL_PASS.includes('your-');

      if (!isEmailConfigured) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file.'
          })
        };
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Store OTP with expiry
      otpStorage.set(email, { otp: otpCode, expiry });

      // Create transporter using nodemailer v7 ESM import
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Email content
      const mailOptions = {
        from: `"Advocate-Client Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Advocate-Client Platform - Email Verification OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3498db; margin: 0;">⚖️ Advocate-Client Platform</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Email Verification</h2>
              <p style="font-size: 16px; color: #555; margin-bottom: 30px;">Your verification code is:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #3498db; margin: 20px 0;">
                <h1 style="color: #2c3e50; font-size: 2.5em; margin: 0; letter-spacing: 8px;">${otpCode}</h1>
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
        body: JSON.stringify({ success: true, message: 'OTP sent to your email successfully' })
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
          body: JSON.stringify({ error: 'OTP not found or expired. Please request a new one.' })
        };
      }

      if (Date.now() > storedData.expiry) {
        otpStorage.delete(email);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'OTP has expired. Please request a new one.' })
        };
      }

      if (storedData.otp !== otp) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid OTP. Please try again.' })
        };
      }

      // OTP verified — remove from storage
      otpStorage.delete(email);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'OTP verified successfully' })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('OTP API Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
