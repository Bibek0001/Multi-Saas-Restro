import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(credentials);

    if (result.success) {
      // If logged in from subdomain/custom domain, redirect to central domain
      if (tenant && !tenant.isCentral) {
        // Redirect to central domain with tenant context
        const centralDomain = process.env.REACT_APP_CENTRAL_DOMAIN || 'http://localhost:3000';
        
        if (result.user.role === 'admin') {
          window.location.href = `${centralDomain}/admin`;
        } else {
          window.location.href = `${centralDomain}/admin/${result.user.tenantId}`;
        }
      } else {
        // Already on central domain, use normal navigation
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(`/admin/${result.user.tenantId}`);
        }
      }
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleCredentialSelect = (selectedCredentials) => {
    setCredentials(selectedCredentials);
    setError(''); // Clear any existing errors
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Restro24 Login</h1>
          <p>Access your restaurant management dashboard</p>
          {tenant && !tenant.isCentral && (
            <p className="tenant-info">Logging in to {tenant.name}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        

        <div className="login-footer">
          <p>
            Multi-tenant restaurant management platform<br/>
            <a href="https://restro24web.netlify.app" target="_blank" rel="noopener noreferrer">Visit Restro24 Platform</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;