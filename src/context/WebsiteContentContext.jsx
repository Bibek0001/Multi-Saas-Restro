import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';

const WebsiteContentContext = createContext();

export const useWebsiteContent = () => {
  const context = useContext(WebsiteContentContext);
  if (!context) {
    throw new Error('useWebsiteContent must be used within a WebsiteContentProvider');
  }
  return context;
};

export const WebsiteContentProvider = ({ children }) => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use tenant.id for subdomains, or user.tenantId for central domain managers
    const id = (tenant && !tenant.isCentral) ? tenant.id : user?.tenantId;
    if (id) {
      fetchContent(id);
    } else {
      setLoading(false);
    }
  }, [tenant, user]);

  const fetchContent = async (tenantId) => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const response = await fetch(`/api/website-content/${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        // Use default content if not found
        setContent(getDefaultContent(tenantId));
      }
    } catch (err) {
      console.error('Error fetching website content:', err);
      // Fallback to mock data
      setContent(getDefaultContent(tenantId));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (tenantId) => {
    const defaults = {
      bcd: {
        tenantId: 'bcd',
        profile: {
          name: 'BCD Restaurant',
          tagline: 'Premium Dining Experience',
          description: 'Experience the finest culinary artistry at BCD Restaurant, where every dish tells a story of passion, tradition, and innovation.',
          logo: '/assets/bcd-logo.png',
          heroImage: '/assets/bcd-hero.jpg',
          phone: '+977-1-4441234',
          email: 'info@bcd.restro24.com',
          address: 'Durbar Marg, Kathmandu 44600, Nepal'
        },
        businessHours: {
          monday: { open: '11:00', close: '23:00', closed: false },
          tuesday: { open: '11:00', close: '23:00', closed: false },
          wednesday: { open: '11:00', close: '23:00', closed: false },
          thursday: { open: '11:00', close: '23:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '11:00', close: '23:00', closed: false },
          sunday: { open: '11:00', close: '23:00', closed: false }
        },
        menuItems: [
          {
            id: 1,
            name: 'BCD Signature Burger',
            description: 'Premium wagyu beef with truffle aioli and aged cheddar',
            price: 1299,
            category: 'Main Course',
            image: '/assets/bcd-burger.jpg',
            available: true
          },
          {
            id: 2,
            name: 'Grilled Atlantic Salmon',
            description: 'Fresh salmon with herb butter and seasonal vegetables',
            price: 1499,
            category: 'Main Course',
            image: '/assets/bcd-salmon.jpg',
            available: true
          },
          {
            id: 3,
            name: 'Lobster Risotto',
            description: 'Creamy arborio rice with fresh lobster and saffron',
            price: 1699,
            category: 'Main Course',
            image: '/assets/bcd-risotto.jpg',
            available: true
          }
        ],
        specialties: [
          'Signature Wagyu Steaks',
          'Fresh Seafood Selection',
          'Artisanal Pasta Dishes',
          'Premium Wine Collection'
        ],
        socialMedia: {
          facebook: 'https://facebook.com/bcdrestaurant',
          instagram: 'https://instagram.com/bcdrestaurant',
          twitter: 'https://twitter.com/bcdrestaurant'
        }
      },
      cdf: {
        tenantId: 'cdf',
        profile: {
          name: 'CDF Bistro',
          tagline: 'Casual Dining & Fresh Flavors',
          description: 'CDF Bistro brings you a delightful blend of comfort food and contemporary cuisine in a relaxed, welcoming atmosphere.',
          logo: '/assets/cdf-logo.png',
          heroImage: '/assets/cdf-hero.jpg',
          phone: '+977-1-4445678',
          email: 'info@cdf.restro24.com',
          address: 'Thamel, Kathmandu 44600, Nepal'
        },
        businessHours: {
          monday: { open: '10:00', close: '22:00', closed: false },
          tuesday: { open: '10:00', close: '22:00', closed: false },
          wednesday: { open: '10:00', close: '22:00', closed: false },
          thursday: { open: '10:00', close: '22:00', closed: false },
          friday: { open: '10:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '22:00', closed: false }
        },
        menuItems: [
          {
            id: 1,
            name: 'Classic Margherita Pizza',
            description: 'Fresh mozzarella, tomato sauce, and basil',
            price: 799,
            category: 'Pizza',
            image: '/assets/cdf-pizza.jpg',
            available: true
          },
          {
            id: 2,
            name: 'Chicken Caesar Salad',
            description: 'Grilled chicken, romaine lettuce, parmesan, croutons',
            price: 599,
            category: 'Salads',
            image: '/assets/cdf-salad.jpg',
            available: true
          }
        ],
        specialties: [
          'Wood-Fired Pizzas',
          'Fresh Salads',
          'Craft Burgers',
          'Homemade Desserts'
        ],
        socialMedia: {
          facebook: 'https://facebook.com/cdfbistro',
          instagram: 'https://instagram.com/cdfbistro',
          twitter: 'https://twitter.com/cdfbistro'
        }
      }
    };

    return defaults[tenantId] || defaults.bcd;
  };

  const updateProfile = async (profileData) => {
    try {
      // Validate required fields
      if (!profileData.name || !profileData.phone) {
        throw new Error('Name and phone number are required');
      }

      // Validate email format
      if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        throw new Error('Invalid email format');
      }

      // Mock API call
      const response = await fetch(`/api/website-content/${tenant.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Update local state
      setContent(prev => ({
        ...prev,
        profile: { ...prev.profile, ...profileData }
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateBusinessHours = async (hoursData) => {
    try {
      // Validate hours
      Object.entries(hoursData).forEach(([day, hours]) => {
        if (!hours.closed && hours.open >= hours.close) {
          throw new Error(`Invalid hours for ${day}: opening time must be before closing time`);
        }
      });

      // Mock API call
      const response = await fetch(`/api/website-content/${tenant.id}/hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hoursData)
      });

      if (!response.ok) throw new Error('Failed to update business hours');

      setContent(prev => ({
        ...prev,
        businessHours: hoursData
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const addMenuItem = async (menuItem) => {
    try {
      // Validate menu item
      if (!menuItem.name || !menuItem.price) {
        throw new Error('Name and price are required');
      }
      if (menuItem.price <= 0) {
        throw new Error('Price must be a positive number');
      }

      const newItem = {
        ...menuItem,
        id: Date.now(),
        tenantId: tenant.id
      };

      // Mock API call
      const response = await fetch(`/api/website-content/${tenant.id}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (!response.ok) throw new Error('Failed to add menu item');

      setContent(prev => ({
        ...prev,
        menuItems: [...prev.menuItems, newItem]
      }));

      return { success: true, item: newItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateMenuItem = async (itemId, updates) => {
    try {
      // Validate updates
      if (updates.price !== undefined && updates.price <= 0) {
        throw new Error('Price must be a positive number');
      }

      // Mock API call
      const response = await fetch(`/api/website-content/${tenant.id}/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update menu item');

      setContent(prev => ({
        ...prev,
        menuItems: prev.menuItems.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      // Mock API call
      const response = await fetch(`/api/website-content/${tenant.id}/menu/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete menu item');

      setContent(prev => ({
        ...prev,
        menuItems: prev.menuItems.filter(item => item.id !== itemId)
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const uploadImage = async (file, type) => {
    try {
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file format. Only JPEG, PNG, and WebP are allowed');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must not exceed 5MB');
      }

      // Mock upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch(`/api/website-content/${tenant.id}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const { url } = await response.json();
      return { success: true, url };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    content,
    loading,
    error,
    updateProfile,
    updateBusinessHours,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    uploadImage,
    refreshContent: () => fetchContent(tenant?.id)
  };

  return (
    <WebsiteContentContext.Provider value={value}>
      {children}
    </WebsiteContentContext.Provider>
  );
};
