// Authentication service with proper deployment URLs
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Use current domain for deployed version
    return window.location.origin;
  }
  return 'http://localhost:8888';
};

export const authService = {
  // Register user with email OTP
  register: async (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    // Store user data temporarily (without verification)
    const tempUser = {
      id: Date.now().toString(),
      ...userData,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(tempUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Send OTP via email
    try {
      const response = await fetch(`${getApiUrl()}/.netlify/functions/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          action: 'send'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      return { success: true, message: 'OTP sent to your email. Please check your inbox.' };
    } catch (error) {
      // Fallback to localStorage OTP for development/testing
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Fallback OTP for ${userData.email}: ${otp}`);
      
      // Store OTP in localStorage for development
      localStorage.setItem(`otp_${userData.email}`, JSON.stringify({
        otp,
        expiry: Date.now() + 5 * 60 * 1000
      }));
      
      alert(`Fallback Mode: OTP is ${otp}`);
      return { success: true, message: 'OTP sent (fallback mode)' };
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      // Try API first
      const response = await fetch(`${getApiUrl()}/.netlify/functions/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          action: 'verify'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'OTP verification failed');
      }
    } catch (error) {
      // Fallback to localStorage OTP for development/testing
      const storedOTP = localStorage.getItem(`otp_${email}`);
      if (!storedOTP) {
        throw new Error('OTP not found or expired');
      }

      const { otp: storedOTPValue, expiry } = JSON.parse(storedOTP);
      
      if (Date.now() > expiry) {
        localStorage.removeItem(`otp_${email}`);
        throw new Error('OTP expired');
      }

      if (storedOTPValue !== otp) {
        throw new Error('Invalid OTP');
      }

      localStorage.removeItem(`otp_${email}`);
    }

    // Update user verification status
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].isVerified = true;
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Email verified successfully' };
  },

  // Login user
  login: async (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    localStorage.setItem('currentUser', JSON.stringify(userSession));
    return userSession;
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('currentUser');
  }
};