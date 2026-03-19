import React, { useState } from 'react';
import '../styles/LoginCredentials.css';

const LoginCredentials = ({ onCredentialSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  const credentials = [
    {
      title: 'Admin Access',
      email: 'admin@restro.com',
      password: 'Admin@123',
      description: 'Full system access to all restaurants',
      role: 'Administrator'
    },
    {
      title: 'BCD Restaurant',
      email: 'star@scb.com',
      password: 'Star@123',
      description: 'BCD Restaurant manager access',
      role: 'Manager'
    },
    {
      title: 'CDF Bistro',
      email: 'manager@dt.com',
      password: 'Manager@123',
      description: 'CDF Bistro manager access',
      role: 'Manager'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
    });
  };

  const fillCredentials = (email, password) => {
    // Use the callback to update parent component state
    if (onCredentialSelect) {
      onCredentialSelect({ email, password });
    }
    
    // Close the panel
    setIsVisible(false);
  };

  return (
    <div className="login-credentials">
      <button 
        className="credentials-toggle"
        onClick={() => setIsVisible(!isVisible)}
        type="button"
      >
        {isVisible ? 'Hide Credentials' : 'Demo Credentials'}
      </button>
      
      {isVisible && (
        <div className="credentials-panel">
          <div className="credentials-header">
            <h3>Demo Login Credentials</h3>
            <p>Use these credentials to test the application</p>
          </div>
          
          <div className="credentials-list">
            {credentials.map((cred, index) => (
              <div key={index} className="credential-item">
                <div className="credential-header">
                  <h4>{cred.title}</h4>
                  <span className="role-badge">{cred.role}</span>
                </div>
                <p className="credential-description">{cred.description}</p>
                
                <div className="credential-actions">
                  <button 
                    onClick={() => fillCredentials(cred.email, cred.password)}
                    className="fill-btn"
                    type="button"
                  >
                    Quick Fill
                  </button>
                </div>
                
                <div className="credential-field">
                  <label>Email:</label>
                  <div className="field-container">
                    <code>{cred.email}</code>
                    <button 
                      onClick={() => copyToClipboard(cred.email)}
                      className="copy-btn"
                      type="button"
                      title="Copy email"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="credential-field">
                  <label>Password:</label>
                  <div className="field-container">
                    <code>{cred.password}</code>
                    <button 
                      onClick={() => copyToClipboard(cred.password)}
                      className="copy-btn"
                      type="button"
                      title="Copy password"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="credentials-footer">
            <p><strong>Note:</strong> These are demo credentials for testing purposes only.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginCredentials;