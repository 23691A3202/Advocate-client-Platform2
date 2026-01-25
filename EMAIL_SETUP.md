# Email OTP Setup Guide

## 🔧 Email Configuration

### 1. Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to **Google Account Settings** > **Security** > **App passwords**
3. Generate an **App Password** for this application
4. Use the generated password (not your regular Gmail password)

### 2. Environment Variables

#### For Local Development:
Create `.env.local` file:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

#### For Netlify Deployment:
1. Go to Netlify Dashboard > Site Settings > Environment Variables
2. Add these variables:
   - `EMAIL_USER`: your-gmail@gmail.com
   - `EMAIL_PASS`: your-16-digit-app-password

## 🚀 Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your email credentials
```

### 3. Start Development Server
```bash
# This starts both frontend and serverless functions
npm run dev
```

### 4. Test OTP Flow
1. Register with a real email address
2. Check your email for OTP
3. Verify OTP to complete registration

## 📧 OTP Features

### ✅ **Implemented Features**
- **6-digit OTP generation**
- **Email delivery via Nodemailer**
- **5-minute expiry**
- **No OTP exposure in console/UI**
- **Environment variable configuration**
- **Works on localhost and deployment**

### 🔒 **Security Features**
- OTP stored server-side only
- Automatic expiry cleanup
- No OTP in API responses
- Secure email transmission

## 🌐 Deployment

### GitHub + Netlify
1. **Push to GitHub**:
```bash
git add .
git commit -m "Add email OTP verification"
git push origin main
```

2. **Configure Netlify**:
   - Connect GitHub repository
   - Set environment variables (EMAIL_USER, EMAIL_PASS)
   - Deploy automatically

### Environment Variables on Netlify
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## 🧪 Testing

### Local Testing
- Uses Netlify Dev for serverless functions
- Fallback to console OTP in development
- Real email sending when configured

### Production Testing
- Real email OTP delivery
- 5-minute expiry enforcement
- Secure OTP verification

## 📱 New Features Added

### Personal Details in Cases
- **Full Name** (auto-filled from profile)
- **Email** (auto-filled, read-only)
- **Phone Number** (required)
- **City/Location** (required)
- **Visible to advocates** in case reviews

### Enhanced Case Management
- Personal details displayed in advocate dashboard
- Complete client information in case modals
- Professional case presentation

The application now has **production-ready email OTP verification** with complete personal details collection!