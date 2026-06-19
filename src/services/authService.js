import { supabase } from './supabaseClient';

const getApiUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:8888';
};

export const authService = {
  register: async (userData) => {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existing) throw new Error('User with this email already exists');

    // Insert new user
    const { error } = await supabase.from('users').insert([{
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      is_verified: false,
    }]);

    if (error) throw new Error(error.message);

    // Send OTP
    try {
      const response = await fetch(`${getApiUrl()}/.netlify/functions/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, action: 'send' }),
      });

      if (response.ok) {
        return { success: true, message: 'OTP sent to your email.' };
      }
    } catch {
      // API not available, use fallback
    }

    // Fallback OTP for dev/testing
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`otp_${userData.email}`, JSON.stringify({
      otp, expiry: Date.now() + 5 * 60 * 1000
    }));
    alert(`Your OTP is: ${otp}`);
    return { success: true };
  },

  verifyOTP: async (email, otp) => {
    // Try API first
    try {
      const response = await fetch(`${getApiUrl()}/.netlify/functions/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, action: 'verify' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
    } catch {
      // Fallback for dev
      const stored = localStorage.getItem(`otp_${email}`);
      if (!stored) throw new Error('OTP not found or expired');
      const { otp: storedOtp, expiry } = JSON.parse(stored);
      if (Date.now() > expiry) { localStorage.removeItem(`otp_${email}`); throw new Error('OTP expired'); }
      if (storedOtp !== otp) throw new Error('Invalid OTP');
      localStorage.removeItem(`otp_${email}`);
    }

    // Mark user as verified in Supabase
    const { error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', email);

    if (error) throw new Error(error.message);
    return { success: true };
  },

  login: async (email, password) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) throw new Error('Invalid email or password');
    if (!user.is_verified) throw new Error('Please verify your email first');

    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      city: user.city,
    };

    localStorage.setItem('currentUser', JSON.stringify(session));
    return session;
  },

  getCurrentUser: () => {
    const u = localStorage.getItem('currentUser');
    return u ? JSON.parse(u) : null;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },
};