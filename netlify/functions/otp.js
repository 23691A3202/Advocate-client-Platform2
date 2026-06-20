const nodemailer = require('nodemailer');

const otpStorage = new Map();

const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiry) otpStorage.delete(email);
  }
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, action, otp } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) };
    }

    cleanExpiredOTPs();

    if (action === 'send') {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email service not configured' }) };
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpStorage.set(email, { otp: otpCode, expiry: Date.now() + 5 * 60 * 1000 });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Advocate-Client Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3498db; text-align: center;">⚖️ Advocate-Client Platform</h1>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #2c3e50;">Email Verification</h2>
              <p style="font-size: 16px; color: #555;">Your verification code is:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #3498db; margin: 20px 0;">
                <h1 style="color: #2c3e50; font-size: 2.5em; margin: 0; letter-spacing: 8px;">${otpCode}</h1>
              </div>
              <p style="color: #e74c3c; font-weight: bold;">Expires in 5 minutes</p>
            </div>
          </div>
        `
      });

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'OTP sent successfully' }) };

    } else if (action === 'verify') {
      if (!otp) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'OTP is required' }) };
      }

      const storedData = otpStorage.get(email);
      if (!storedData) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'OTP not found or expired' }) };
      }

      if (Date.now() > storedData.expiry) {
        otpStorage.delete(email);
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'OTP expired' }) };
      }

      if (storedData.otp !== otp) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid OTP' }) };
      }

      otpStorage.delete(email);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'OTP verified successfully' }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };

  } catch (error) {
    console.error('OTP Error:', error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};