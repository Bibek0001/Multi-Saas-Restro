import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectTenant();
  }, []);

  const detectTenant = () => {
    const hostname = window.location.hostname;
    
    // Check if it's the main restro24.com domain
    if (hostname === 'restro24.com' || hostname === 'localhost') {
      // For central domain, tenant might be determined by URL params or login
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      
      if (tenantParam) {
        fetchTenantData(tenantParam);
      } else {
        setTenant({
          id: 'central',
          name: 'Restro24',
          domain: hostname,
          isCentral: true,
          theme: {
            primaryColor: '#2563eb',
            secondaryColor: '#1e40af',
            logo: '/assets/restro24-logo.png'
          }
        });
        setLoading(false);
      }
    } else if (hostname.endsWith('.restro24.com')) {
      // Subdomain detection (e.g., bcd.restro24.com, cdf.restro24.com)
      const subdomain = hostname.split('.')[0];
      fetchTenantData(subdomain);
    } else {
      // Custom domain - fetch tenant by domain
      fetchTenantByDomain(hostname);
    }
  };

  const fetchTenantData = async (tenantId) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/tenants/${tenantId}`);
      const tenantData = await response.json();
      setTenant(tenantData);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      // Fallback to mock data for development
      setTenant(getMockTenantData(tenantId));
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantByDomain = async (domain) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/tenants/by-domain/${domain}`);
      const tenantData = await response.json();
      setTenant(tenantData);
    } catch (error) {
      console.error('Error fetching tenant by domain:', error);
      // Fallback to mock data for development
      setTenant(getMockTenantByDomain(domain));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTenant = (tenantId) => ({
    id: tenantId,
    name: `Restaurant ${tenantId.toUpperCase()}`,
    domain: `${tenantId}.restro24.com`,
    isCentral: false,
    isSubdomain: true,
    theme: {
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c',
      logo: '/assets/default-logo.png'
    }
  });

  const getMockTenantData = (tenantId) => {
    const mockTenants = {
      'bcd': {
        id: 'bcd',
        name: 'BCD Restaurant',
        domain: 'bcd.restro24.com',
        isCentral: false,
        isSubdomain: true,
        theme: {
          primaryColor: '#dc2626',
          secondaryColor: '#b91c1c',
          logo: '/assets/bcd-logo.png'
        }
      },
      'cdf': {
        id: 'cdf',
        name: 'CDF Bistro',
        domain: 'cdf.restro24.com',
        isCentral: false,
        isSubdomain: true,
        theme: {
          primaryColor: '#059669',
          secondaryColor: '#047857',
          logo: '/assets/cdf-logo.png'
        }
      }
    };
    
    return mockTenants[tenantId] || getDefaultTenant(tenantId);
  };

  const getMockTenantByDomain = (domain) => {
    const mockTenants = {
      'bcd.com': {
        id: 'bcd',
        name: 'BCD Restaurant',
        domain: 'bcd.com',
        isCentral: false,
        isSubdomain: false,
        theme: {
          primaryColor: '#dc2626',
          secondaryColor: '#b91c1c',
          logo: '/assets/bcd-logo.png'
        }
      },
      'cdf.com': {
        id: 'cdf',
        name: 'CDF Bistro',
        domain: 'cdf.com',
        isCentral: false,
        isSubdomain: false,
        theme: {
          primaryColor: '#059669',
          secondaryColor: '#047857',
          logo: '/assets/cdf-logo.png'
        }
      }
    };
    
    return mockTenants[domain] || getDefaultTenant('unknown');
  };

  const value = {
    tenant,
    loading,
    setTenant,
    refreshTenant: detectTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};