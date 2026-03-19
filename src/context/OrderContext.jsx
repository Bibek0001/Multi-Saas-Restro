import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('restro24_orders');
      const parsed = savedOrders ? JSON.parse(savedOrders) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      return [];
    }
  });

  const [reservations, setReservations] = useState(() => {
    try {
      const savedReservations = localStorage.getItem('restro24_reservations');
      const parsed = savedReservations ? JSON.parse(savedReservations) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading reservations from localStorage:', error);
      return [];
    }
  });

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('restro24_orders', JSON.stringify(orders));
  }, [orders]);

  // Save to localStorage whenever reservations change
  useEffect(() => {
    localStorage.setItem('restro24_reservations', JSON.stringify(reservations));
  }, [reservations]);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    console.log('OrderContext: Setting up storage event listener');
    
    const handleStorageChange = (e) => {
      console.log('Storage event detected:', {
        key: e.key,
        oldValue: e.oldValue ? 'exists' : 'null',
        newValue: e.newValue ? 'exists' : 'null',
        url: e.url
      });
      
      if (e.key === 'restro24_orders' && e.newValue) {
        try {
          const newOrders = JSON.parse(e.newValue);
          console.log('Syncing orders from another tab, count:', newOrders.length);
          setOrders(Array.isArray(newOrders) ? newOrders : []);
        } catch (error) {
          console.error('Error parsing orders from storage event:', error);
        }
      }
      
      if (e.key === 'restro24_reservations' && e.newValue) {
        try {
          const newReservations = JSON.parse(e.newValue);
          console.log('Syncing reservations from another tab, count:', newReservations.length);
          setReservations(Array.isArray(newReservations) ? newReservations : []);
        } catch (error) {
          console.error('Error parsing reservations from storage event:', error);
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    console.log('OrderContext: Storage event listener added');

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log('OrderContext: Storage event listener removed');
    };
  }, []);

  // Polling fallback - check localStorage every 1 second for changes
  useEffect(() => {
    console.log('OrderContext: Setting up polling fallback (1 second interval)');
    
    const pollInterval = setInterval(() => {
      try {
        // Check orders
        const savedOrders = localStorage.getItem('restro24_orders');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          if (JSON.stringify(parsedOrders) !== JSON.stringify(orders)) {
            console.log('Polling: Detected orders change, syncing...', parsedOrders.length);
            setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
          }
        }
        
        // Check reservations
        const savedReservations = localStorage.getItem('restro24_reservations');
        if (savedReservations) {
          const parsedReservations = JSON.parse(savedReservations);
          if (JSON.stringify(parsedReservations) !== JSON.stringify(reservations)) {
            console.log('Polling: Detected reservations change, syncing...', parsedReservations.length);
            setReservations(Array.isArray(parsedReservations) ? parsedReservations : []);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000); // Poll every 1 second for faster updates

    return () => {
      clearInterval(pollInterval);
      console.log('OrderContext: Polling stopped');
    };
  }, [orders, reservations]);

  const addOrder = (orderData) => {
    const newOrder = {
      id: `ORD${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('OrderContext: Adding order', newOrder);
    setOrders(prev => {
      const updated = Array.isArray(prev) ? [newOrder, ...prev] : [newOrder];
      console.log('OrderContext: Orders updated, total count:', updated.length);
      return updated;
    });
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
    });
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.filter(order => order.id !== orderId);
    });
  };

  const getOrdersByTenant = (tenantId) => {
    if (!Array.isArray(orders)) return [];
    return orders.filter(order => order.tenantId === tenantId);
  };

  const addReservation = (reservationData) => {
    const newReservation = {
      id: `RES${Date.now()}`,
      ...reservationData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('OrderContext: Adding reservation', newReservation);
    setReservations(prev => {
      const updated = Array.isArray(prev) ? [newReservation, ...prev] : [newReservation];
      console.log('OrderContext: Reservations updated, total count:', updated.length);
      return updated;
    });
    return newReservation;
  };

  const updateReservationStatus = (reservationId, newStatus) => {
    setReservations(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: newStatus, updatedAt: new Date().toISOString() }
          : reservation
      );
    });
  };

  const deleteReservation = (reservationId) => {
    setReservations(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.filter(reservation => reservation.id !== reservationId);
    });
  };

  const getReservationsByTenant = (tenantId) => {
    if (!Array.isArray(reservations)) return [];
    return reservations.filter(reservation => reservation.tenantId === tenantId);
  };

  const getTodayReservations = (tenantId) => {
    if (!Array.isArray(reservations)) return [];
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(reservation => 
      reservation.tenantId === tenantId && 
      reservation.date === today
    );
  };

  const value = {
    orders,
    reservations,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByTenant,
    addReservation,
    updateReservationStatus,
    deleteReservation,
    getReservationsByTenant,
    getTodayReservations
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
