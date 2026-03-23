import React, { useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

const TenantDetector = ({ children }) => {
  const { tenant, loading } = useTenant();

  useEffect(() => {
    if (tenant && !loading) {
      // Apply tenant theme
      document.documentElement.style.setProperty('--primary-color', tenant.theme.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', tenant.theme.secondaryColor);
      
      // Update page title
      document.title = tenant.isCentral ? 'Restro24' : tenant.name;
    }
  }, [tenant, loading]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return children;
};

export default TenantDetector;