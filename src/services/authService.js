const getApiUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:8888';
};

// Seed demo data on first load
const seedDemoData = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.length === 0) {
    const demoUsers = [
      { id: 'admin-1', name: 'Admin User', email: 'admin@lexai.com', password: 'admin123', role: 'admin', isVerified: true, createdAt: new Date().toISOString(), phone: '+91-9876543210', avatar: null },
      { id: 'adv-1', name: 'Adv. Priya Sharma', email: 'priya@lexai.com', password: 'adv123', role: 'advocate', isVerified: true, createdAt: new Date().toISOString(), phone: '+91-9876543211', specialization: 'Criminal Law', experience: 8, approvalStatus: 'approved', barCouncilId: 'MH/1234/2016', avatar: null },
      { id: 'adv-2', name: 'Adv. Rahul Verma', email: 'rahul@lexai.com', password: 'adv123', role: 'advocate', isVerified: true, createdAt: new Date().toISOString(), phone: '+91-9876543212', specialization: 'Property Law', experience: 12, approvalStatus: 'approved', barCouncilId: 'DL/5678/2012', avatar: null },
      { id: 'adv-3', name: 'Adv. Meera Nair', email: 'meera@lexai.com', password: 'adv123', role: 'advocate', isVerified: true, createdAt: new Date().toISOString(), phone: '+91-9876543213', specialization: 'Family Law', experience: 6, approvalStatus: 'pending', barCouncilId: 'KL/9012/2018', avatar: null },
      { id: 'cli-1', name: 'Arjun Kumar', email: 'arjun@gmail.com', password: 'cli123', role: 'client', isVerified: true, createdAt: new Date().toISOString(), phone: '+91-9876543220', city: 'Mumbai', avatar: null },
      { id: 'cli-2', name: 'Sunita Patel', email: 'sunita@gmail.com', password: 'cli123', role: 'client', isVerified: true, createdAt: new Date().toISOString(), phone: '+91-9876543221', city: 'Delhi', avatar: null },
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
  }
};

export const authService = {
  init: () => seedDemoData(),

  register: async (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isVerified: false,
      createdAt: new Date().toISOString(),
      approvalStatus: userData.role === 'advocate' ? 'approved' : 'approved',
      avatar: null,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    const response = await fetch(`${getApiUrl()}/.netlify/functions/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userData.email, action: 'send' }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send OTP email.');
    return { success: true, message: 'OTP sent to your email. Please check your inbox.' };
  },

  verifyOTP: async (email, otp) => {
    const response = await fetch(`${getApiUrl()}/.netlify/functions/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, action: 'verify' }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'OTP verification failed');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) throw new Error('User not found');
    users[idx].isVerified = true;
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
  },

  login: async (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    if (!user.isVerified) throw new Error('Please verify your email first');
    const session = {
      id: user.id, email: user.email, name: user.name,
      role: user.role, phone: user.phone, city: user.city,
      specialization: user.specialization, experience: user.experience,
      barCouncilId: user.barCouncilId, avatar: user.avatar,
      approvalStatus: user.approvalStatus,
    };
    localStorage.setItem('currentUser', JSON.stringify(session));
    authService.addAuditLog('LOGIN', user.id, `User ${user.name} logged in`);
    return session;
  },

  logout: () => {
    const user = authService.getCurrentUser();
    if (user) authService.addAuditLog('LOGOUT', user.id, `User ${user.name} logged out`);
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    const u = localStorage.getItem('currentUser');
    return u ? JSON.parse(u) : null;
  },

  updateProfile: (userId, updates) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    const session = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (session && session.id === userId) {
      const updated = { ...session, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
    return users[idx];
  },

  getAllUsers: () => JSON.parse(localStorage.getItem('users') || '[]'),

  getUserById: (id) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === id) || null;
  },

  getAdvocates: (status = 'approved') => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(u => u.role === 'advocate' && u.approvalStatus === status);
  },

  suspendUser: (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) { users[idx].suspended = !users[idx].suspended; localStorage.setItem('users', JSON.stringify(users)); }
  },

  approveAdvocate: (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) { users[idx].approvalStatus = 'approved'; users[idx].isVerified = true; localStorage.setItem('users', JSON.stringify(users)); }
  },

  rejectAdvocate: (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) { users[idx].approvalStatus = 'rejected'; localStorage.setItem('users', JSON.stringify(users)); }
  },

  addAuditLog: (action, userId, description) => {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    logs.unshift({ id: Date.now().toString(), action, userId, description, timestamp: new Date().toISOString() });
    if (logs.length > 500) logs.pop();
    localStorage.setItem('auditLogs', JSON.stringify(logs));
  },

  getAuditLogs: () => JSON.parse(localStorage.getItem('auditLogs') || '[]'),
};