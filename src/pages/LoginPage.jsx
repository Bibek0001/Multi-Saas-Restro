import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateLogin = () => {
    const e = {};
    if (!credentials.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) e.email = 'Enter a valid email address';
    if (!credentials.password) e.password = 'Password is required';
    else if (credentials.password.length < 6) e.password = 'Password must be at least 6 characters';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };
  const { login, isAuthenticated, loading } = useAuth();
  const { tenant } = useTenant();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsLoading(true);
    setError('');

    const result = await login(credentials);

    if (result.success) {
      if (result.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = `/admin/${result.user.tenantId}`;
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
            <input type="email" id="email" name="email" value={credentials.email}
              onChange={(e) => { handleChange(e); setFieldErrors({...fieldErrors, email: ''}); }}
              placeholder="Enter your email"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                value={credentials.password}
                onChange={(e) => { handleChange(e); setFieldErrors({...fieldErrors, password: ''}); }}
                placeholder="Enter your password"
                className={fieldErrors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
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
          <p>Multi-tenant restaurant management platform</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;