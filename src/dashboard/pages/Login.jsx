import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard.css';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    // Initialize default credentials if they don't exist
    if (!localStorage.getItem('rkr_admin_credentials')) {
      localStorage.setItem('rkr_admin_credentials', JSON.stringify({ email: 'admin@rkrsolutions.com', password: 'password123' }));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    const credsStr = localStorage.getItem('rkr_admin_credentials');
    const creds = credsStr ? JSON.parse(credsStr) : { email: 'admin@rkrsolutions.com', password: 'password123' };
    
    if (email === creds.email && password === creds.password) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="dashboard-app">
      <div className="login-page">
        <div className="login-container">
        <div className="login-header">
          <img src="/logo.png" alt="RKR Solutions" className="login-logo-img" />
        </div>
        
        <h2 className="login-title">Admin Portal</h2>
        <p className="login-subtitle">Sign in to manage your business.</p>
        
        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm mb-4 font-medium bg-red-50 p-2 rounded border border-red-200">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="input" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>
          
          <button type="submit" className="btn btn-primary w-full login-btn">
            Login
          </button>
        </form>
        
        <div className="demo-mode-alert">
          <p><strong>Demo Mode Active:</strong> Click Login to access the dashboard. No real credentials are exposed.</p>
        </div>
        </div>
      </div>
    </div>
  );
}
