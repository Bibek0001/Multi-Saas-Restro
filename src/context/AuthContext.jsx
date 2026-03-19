import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Decode and validate mock token
        try {
          const tokenData = JSON.parse(atob(token));
          
          // Check if token is not expired (24 hours)
          const isExpired = Date.now() - tokenData.timestamp > 24 * 60 * 60 * 1000;
          
          if (isExpired) {
            localStorage.removeItem('authToken');
            return;
          }

          // Mock user data based on token
          const mockUsers = {
            1: {
              id: 1,
              name: 'Admin User',
              email: 'admin@restro.com',
              role: 'admin',
              tenantId: tokenData.tenantId || 'central'
            },
            2: {
              id: 2,
              name: 'Star Manager',
              email: 'star@scb.com',
              role: 'manager',
              tenantId: 'bcd'
            },
            3: {
              id: 3,
              name: 'Restaurant Manager',
              email: 'manager@dt.com',
              role: 'manager',
              tenantId: 'cdf'
            }
          };

          const userData = mockUsers[tokenData.userId];
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (decodeError) {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Mock authentication with specific credentials
      const validCredentials = {
        // Admin credentials
        'admin@restro.com': {
          password: 'Admin@123',
          user: {
            id: 1,
            name: 'Admin User',
            email: 'admin@restro.com',
            role: 'admin',
            tenantId: credentials.tenantId || 'central'
          }
        },
        // BCD Restaurant credentials
        'star@scb.com': {
          password: 'Star@123',
          user: {
            id: 2,
            name: 'Star Manager',
            email: 'star@scb.com',
            role: 'manager',
            tenantId: 'bcd'
          }
        },
        // CDF Restaurant credentials
        'manager@dt.com': {
          password: 'Manager@123',
          user: {
            id: 3,
            name: 'Restaurant Manager',
            email: 'manager@dt.com',
            role: 'manager',
            tenantId: 'cdf'
          }
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userCredential = validCredentials[credentials.email];
      
      if (!userCredential || userCredential.password !== credentials.password) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user has access to the requested tenant
      const user = userCredential.user;
      if (credentials.tenantId && user.role !== 'admin' && user.tenantId !== credentials.tenantId) {
        return { success: false, error: 'Access denied for this restaurant' };
      }

      // Generate mock token
      const token = btoa(JSON.stringify({ 
        userId: user.id, 
        email: user.email, 
        tenantId: credentials.tenantId || user.tenantId,
        timestamp: Date.now() 
      }));

      localStorage.setItem('authToken', token);
      setUser(user);
      
      // Set user with tenant information for routing
      const userWithTenant = {
        ...user,
        tenantId: credentials.tenantId || user.tenantId
      };
      
      setUser(userWithTenant);
      
      // Return success with tenant info for routing
      return { 
        success: true, 
        user: userWithTenant,
        redirectTo: user.role === 'admin' ? '/admin' : `/admin/${user.tenantId}`
      };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};