import { useState, useEffect } from 'react';
import { Login, Register, OTPVerification } from './components/Auth';
import { ClientDashboard } from './components/ClientDashboard';
import { AdvocateDashboard } from './components/AdvocateDashboard';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login', 'register', 'otp'
  const [otpEmail, setOtpEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAuthView('login');
  };

  const handleSwitchToRegister = () => {
    setAuthView('register');
  };

  const handleSwitchToLogin = () => {
    setAuthView('login');
  };

  const handleSwitchToOTP = (email) => {
    setOtpEmail(email);
    setAuthView('otp');
  };

  const handleOTPVerified = () => {
    setAuthView('login');
    alert('Email verified successfully! You can now login.');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // If user is logged in, show appropriate dashboard
  if (currentUser) {
    return currentUser.role === 'client' ? (
      <ClientDashboard user={currentUser} onLogout={handleLogout} />
    ) : (
      <AdvocateDashboard user={currentUser} onLogout={handleLogout} />
    );
  }

  // Show authentication views
  return (
    <div className="app">
      <header className="app-header">
        <div className="hero-content">
          <div className="hero-icon">
            ⚖️
          </div>
          <h1>Advocate-Client Platform</h1>
          <p>Professional Legal Case Management System</p>
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">👨💼</span>
              <span>Expert Advocates</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📋</span>
              <span>Case Management</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Secure Platform</span>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>
      </header>
      
      {authView === 'login' && (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}
      
      {authView === 'register' && (
        <Register 
          onSwitchToLogin={handleSwitchToLogin}
          onSwitchToOTP={handleSwitchToOTP}
        />
      )}
      
      {authView === 'otp' && (
        <OTPVerification 
          email={otpEmail}
          onVerified={handleOTPVerified}
          onBack={handleSwitchToLogin}
        />
      )}
    </div>
  );
}

export default App;