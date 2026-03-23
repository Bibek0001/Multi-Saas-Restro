import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import PaymentModal from '../components/PaymentModal';
import BillModal from '../components/BillModal';
import '../styles/Dashboard.css';

const CDFDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, reservations, updateOrderStatus, updateReservationStatus } = useOrders();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const tenantId = 'cdf';
  
  // Directly filter orders and reservations from context - this creates proper dependencies
  const tenantOrders = orders.filter(order => order.tenantId === tenantId);
  const tenantReservations = reservations.filter(reservation => reservation.tenantId === tenantId);
  const todayReservations = (() => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(reservation => 
      reservation.tenantId === tenantId && 
      reservation.date === today
    );
  })();

  // Auto-refresh data every 2 seconds for more responsive updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // Force re-render to pick up any localStorage changes
      console.log('Auto-refresh triggered for CDF Dashboard');
    }, 2000); // Reduced from 5000 to 2000 for faster updates

    return () => clearInterval(interval);
  }, []);

  // Also refresh when window gains focus (user switches back to this tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('CDF Dashboard gained focus, refreshing data');
      setLastUpdated(new Date());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (tab) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 300);
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'overview':
          return <CDFOverviewTab orders={tenantOrders} reservations={todayReservations} navigate={navigate} />;
        case 'orders':
          return <CDFOrdersTab orders={tenantOrders} updateOrderStatus={updateOrderStatus} />;
        case 'pos':
          return <CDFPOSTab navigate={navigate} />;
        case 'menu':
          return <CDFMenuTab />;
        case 'settings':
          return <CDFSettingsTab navigate={navigate} />;
        default:
          return <CDFOverviewTab orders={tenantOrders} reservations={todayReservations} navigate={navigate} />;
      }
    })();

    return (
      <div className={isLoading ? 'loading' : ''}>
        {content}
      </div>
    );
  };

  const pendingOrders = tenantOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="dashboard cdf-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>CDF Bistro Dashboard</h1>
          <span className="tenant-badge">CDF Manager</span>
        </div>
        <div className="header-right">
          {pendingOrders > 0 && (
            <div className="notification-badge" title={`${pendingOrders} pending orders`}>
              {pendingOrders}
            </div>
          )}
          <span>Welcome, {user?.name}</span>
          <a href="https://restro24web.netlify.app" target="_blank" rel="noopener noreferrer" className="restro-link">
            Restro24 Platform
          </a>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => handleTabChange('orders')}
          >
            Orders {pendingOrders > 0 && `(${pendingOrders})`}
          </button>
          <button 
            className={activeTab === 'pos' ? 'active' : ''}
            onClick={() => handleTabChange('pos')}
          >
            POS
          </button>
          <button 
            className={activeTab === 'menu' ? 'active' : ''}
            onClick={() => handleTabChange('menu')}
          >
            Menu
          </button>
          <button 
            className={activeTab === 'website' ? 'active' : ''}
            onClick={() => navigate('/admin/website')}
          >
            Website Content
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => handleTabChange('settings')}
          >
            Settings
          </button>
        </nav>

        <main className="dashboard-main">
          {renderContent()}
          <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </main>
      </div>
    </div>
  );
};

const CDFOverviewTab = ({ orders, reservations, navigate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force a re-read from localStorage
    window.dispatchEvent(new Event('storage'));
    console.log('Manual refresh triggered - forcing data reload');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleNewOrder = () => {
    navigate('/order');
  };

  const handleViewReservations = () => {
    navigate('/restaurants/cdf');
  };

  const handlePOS = () => {
    navigate('/pos');
  };

  return (
    <div className="overview-tab">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <h2>CDF Bistro Overview</h2>
        <button 
          className="action-btn" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{opacity: isRefreshing ? 0.6 : 1}}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p className="stat-number">{todayOrders.length}</p>
          <span className="stat-change positive">{pendingOrders} pending</span>
        </div>
        <div className="stat-card">
          <h3>Today's Revenue</h3>
          <p className="stat-number">NPR {todayRevenue.toLocaleString()}</p>
          <span className="stat-change positive">+{orders.length > 0 ? Math.round((todayRevenue / orders.length) * 100) / 100 : 0}% avg</span>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{orders.length}</p>
          <span className="stat-change">All time</span>
        </div>
      </div>

      {todayOrders.length > 0 && (
        <div className="recent-orders-section" style={{marginTop: '2rem'}}>
          <h3>Recent Orders</h3>
          <div className="orders-list">
            {todayOrders.slice(0, 5).map(order => (
              <div key={order.id} className="order-item">
                <span className="order-id">{order.id}</span>
                <span className="order-customer">{order.customerName}</span>
                <span className="order-items">{order.itemCount} items</span>
                <span className="order-amount">NPR {order.totalAmount}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CDFPOSTab = ({ navigate }) => {
  const handleOpenPOS = () => {
    navigate('/pos');
  };

  return (
    <div className="pos-tab">
      <h2>Point of Sale System</h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>🛒</div>
          <h3 style={{marginBottom: '1rem'}}>CDF Bistro POS System</h3>
          <p style={{
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Access the full Point of Sale system to process orders, manage transactions, 
            and handle in-store customer payments efficiently.
          </p>
          <button 
            className="action-btn"
            onClick={handleOpenPOS}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}
          >
            Open POS System
          </button>
        </div>
      </div>
    </div>
  );
};

const CDFOrdersTab = ({ orders, updateOrderStatus }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrdersForMerge, setSelectedOrdersForMerge] = useState([]);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billOrder, setBillOrder] = useState(null);

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handlePayBill = (order) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (paymentMethod) => {
    if (selectedOrder) {
      // Update order with payment information
      const updatedOrder = {
        ...selectedOrder,
        paymentMethod: paymentMethod,
        paymentStatus: 'paid',
        paidAt: new Date().toISOString()
      };
      
      // Update in localStorage
      const savedOrders = localStorage.getItem('restro24_orders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        const updatedOrders = allOrders.map(o => 
          o.id === selectedOrder.id ? updatedOrder : o
        );
        localStorage.setItem('restro24_orders', JSON.stringify(updatedOrders));
      }
      
      // Mark as completed if in-progress
      if (selectedOrder.status === 'in-progress') {
        handleStatusChange(selectedOrder.id, 'completed');
      }
      
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleCheckboxChange = (orderId, isChecked) => {
    if (isChecked) {
      setSelectedOrdersForMerge(prev => [...prev, orderId]);
    } else {
      setSelectedOrdersForMerge(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleMergeSelected = () => {
    if (selectedOrdersForMerge.length < 2) {
      alert('Please select at least 2 orders to merge');
      return;
    }

    const savedOrders = localStorage.getItem('restro24_orders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const ordersToMerge = allOrders.filter(o => selectedOrdersForMerge.includes(o.id));
      
      // Combine all items from selected orders
      const combinedItems = ordersToMerge.flatMap(o => o.items);
      const totalAmount = ordersToMerge.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalItemCount = combinedItems.length;
      
      // Get customer info from first order
      const firstOrder = ordersToMerge[0];
      
      // Create new merged order
      const mergedOrder = {
        id: `ORD${Date.now()}`,
        tenantId: firstOrder.tenantId,
        tenantName: firstOrder.tenantName,
        customerName: `Merged - ${firstOrder.customerName}`,
        customerPhone: firstOrder.customerPhone,
        customerEmail: firstOrder.customerEmail,
        deliveryType: firstOrder.deliveryType,
        deliveryAddress: firstOrder.deliveryAddress,
        items: combinedItems,
        itemCount: totalItemCount,
        totalAmount: totalAmount,
        status: 'in-progress',
        isMerged: true,
        mergedFrom: selectedOrdersForMerge,
        mergedOrderIds: selectedOrdersForMerge.join(', '),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Remove old orders and add new merged order
      const updatedOrders = allOrders.filter(o => !selectedOrdersForMerge.includes(o.id));
      updatedOrders.unshift(mergedOrder);
      
      localStorage.setItem('restro24_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('storage'));
      
      alert(`✓ Orders merged successfully!\n\nNew Order ID: ${mergedOrder.id}\nMerged Orders: ${selectedOrdersForMerge.join(', ')}\nTotal Amount: NPR ${totalAmount}\nTotal Items: ${totalItemCount}`);
      setSelectedOrdersForMerge([]);
    }
  };

  const handlePrintBill = (order) => {
    setBillOrder(order);
    setIsBillModalOpen(true);
  };

  return (
    <div className="orders-tab">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>CDF Bistro Orders ({orders.length})</h2>
        {selectedOrdersForMerge.length > 0 && (
          <button 
            className="action-btn"
            onClick={handleMergeSelected}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: 'white'
            }}
          >
            Merge Selected ({selectedOrdersForMerge.length})
          </button>
        )}
      </div>
      <div className="orders-filter">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setActiveFilter('in-progress')}
        >
          In Progress ({orders.filter(o => o.status === 'in-progress').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({orders.filter(o => o.status === 'completed').length})
        </button>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found</p>
          <p className="empty-state-subtitle">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-item-card">
              <div className="order-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  {order.paymentStatus !== 'paid' && (
                    <input
                      type="checkbox"
                      checked={selectedOrdersForMerge.includes(order.id)}
                      onChange={(e) => handleCheckboxChange(order.id, e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                      title="Select for merge"
                    />
                  )}
                  <span className="order-id">{order.id}</span>
                  {order.isMerged && (
                    <span style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }} title={order.mergedOrderIds ? `Merged from: ${order.mergedOrderIds}` : 'Merged order'}>
                      Merged
                    </span>
                  )}
                  {order.isSplit && (
                    <span style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Split
                    </span>
                  )}
                </div>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Email:</strong> {order.customerEmail}</p>
                <p><strong>Type:</strong> {order.deliveryType}</p>
                {order.deliveryAddress && <p><strong>Address:</strong> {order.deliveryAddress}</p>}
                {order.isMerged && order.mergedOrderIds && (
                  <p style={{color: '#f97316', fontWeight: 'bold'}}>
                    <strong>Merged From:</strong> {order.mergedOrderIds}
                  </p>
                )}
                {order.isSplit && order.splitParts && (
                  <p style={{color: '#3b82f6', fontWeight: 'bold'}}>
                    <strong>Split Into:</strong> {order.splitParts} parts
                  </p>
                )}
                <p><strong>Items:</strong> {order.itemCount}</p>
                <p><strong>Total:</strong> NPR {order.totalAmount}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="order-items-list">
                <strong>Order Items:</strong>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-detail">
                    {item.name} x {item.quantity} - NPR {item.price * item.quantity}
                  </div>
                ))}
              </div>
              <div className="order-actions">
                {order.status === 'pending' && (
                  <button 
                    className="action-btn" 
                    onClick={() => handleStatusChange(order.id, 'in-progress')}
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'in-progress' && (
                  <>
                    <button 
                      className="action-btn" 
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}
                    >
                      Mark Complete
                    </button>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      <button 
                        onClick={() => handlePayBill(order)} 
                        style={{
                          flex: '1',
                          minWidth: '120px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          padding: '0.875rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          height: '44px'
                        }}
                      >
                        Pay Bill
                      </button>
                      <button 
                        onClick={() => {
                          const numSplits = prompt('Split bill into how many parts?', '2');
                          if (numSplits) {
                            const splitAmount = (order.totalAmount / parseInt(numSplits)).toFixed(2);
                            alert(`Bill split into ${numSplits} parts\nEach person pays: NPR ${splitAmount}`);
                            
                            // Mark order as split
                            const savedOrders = localStorage.getItem('restro24_orders');
                            if (savedOrders) {
                              const allOrders = JSON.parse(savedOrders);
                              const updatedOrders = allOrders.map(o => 
                                o.id === order.id ? { ...o, isSplit: true, splitParts: parseInt(numSplits) } : o
                              );
                              localStorage.setItem('restro24_orders', JSON.stringify(updatedOrders));
                              window.dispatchEvent(new Event('storage'));
                            }
                          }
                        }} 
                        style={{
                          flex: '1',
                          minWidth: '120px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: 'white',
                          border: 'none',
                          padding: '0.875rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          height: '44px'
                        }}
                      >
                        Split Bill
                      </button>
                      <button 
                        onClick={() => handlePrintBill(order)} 
                        style={{
                          flex: '1',
                          minWidth: '120px',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white',
                          border: 'none',
                          padding: '0.875rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          height: '44px'
                        }}
                      >
                        Print Bill
                      </button>
                    </div>
                  </>
                )}
                {order.status === 'completed' && (
                  <>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                      <span style={{
                        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                        color: '#065f46',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        Completed
                      </span>
                      {order.paymentStatus === 'paid' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          ✓ Paid via {order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod === 'wallet' ? 'Wallet' : 'Card'}
                        </span>
                      )}
                    </div>
                    {order.paymentStatus !== 'paid' ? (
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        <button 
                          onClick={() => handlePayBill(order)} 
                          style={{
                            flex: '1',
                            minWidth: '120px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            height: '44px'
                          }}
                        >
                          Pay Bill
                        </button>
                        <button 
                          onClick={() => {
                            const numSplits = prompt('Split bill into how many parts?', '2');
                            if (numSplits) {
                              const splitAmount = (order.totalAmount / parseInt(numSplits)).toFixed(2);
                              alert(`Bill split into ${numSplits} parts\nEach person pays: NPR ${splitAmount}`);
                              
                              // Mark order as split
                              const savedOrders = localStorage.getItem('restro24_orders');
                              if (savedOrders) {
                                const allOrders = JSON.parse(savedOrders);
                                const updatedOrders = allOrders.map(o => 
                                  o.id === order.id ? { ...o, isSplit: true, splitParts: parseInt(numSplits) } : o
                                );
                                localStorage.setItem('restro24_orders', JSON.stringify(updatedOrders));
                                window.dispatchEvent(new Event('storage'));
                              }
                            }
                          }} 
                          style={{
                            flex: '1',
                            minWidth: '120px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            height: '44px'
                          }}
                        >
                          Split Bill
                        </button>
                        <button 
                          onClick={() => handlePrintBill(order)} 
                          style={{
                            flex: '1',
                            minWidth: '120px',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            height: '44px'
                          }}
                        >
                          Print Bill
                        </button>
                      </div>
                    ) : (
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        <button 
                          onClick={() => handlePrintBill(order)} 
                          style={{
                            flex: '1',
                            minWidth: '120px',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            height: '44px'
                          }}
                        >
                          Print Bill
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Bill Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setBillOrder(null);
        }}
        order={billOrder}
      />
    </div>
  );
};

const CDFMenuTab = () => {
  const handleAddNewItem = () => {
    const itemName = prompt('Enter new menu item name:');
    if (itemName) {
      const price = prompt('Enter price (NPR):');
      if (price) {
        alert(`Added new item: ${itemName} - NPR ${price}`);
      }
    }
  };

  const handleImportMenu = () => {
    alert('Opening menu import dialog...');
  };

  const handleEditItem = (itemName) => {
    alert(`Opening editor for ${itemName}`);
  };

  return (
    <div className="menu-tab">
      <h2>CDF Bistro Menu</h2>
      <div className="menu-actions">
        <button className="add-item-button" onClick={handleAddNewItem}>+ Add New Item</button>
        <button className="import-button" onClick={handleImportMenu}>Import Menu</button>
      </div>
      <div className="menu-categories">
        <div className="category-section">
          <h3>Pizzas</h3>
          <div className="menu-items">
            <div className="menu-item">
              <span className="item-name">Margherita Pizza</span>
              <span className="item-price">NPR 1,299</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Margherita Pizza')}>Edit</button>
            </div>
            <div className="menu-item">
              <span className="item-name">Pepperoni Pizza</span>
              <span className="item-price">NPR 1,599</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Pepperoni Pizza')}>Edit</button>
            </div>
          </div>
        </div>
        
        <div className="category-section">
          <h3>Pasta</h3>
          <div className="menu-items">
            <div className="menu-item">
              <span className="item-name">Pasta Carbonara</span>
              <span className="item-price">NPR 1,299</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Pasta Carbonara')}>Edit</button>
            </div>
            <div className="menu-item">
              <span className="item-name">Pasta Bolognese</span>
              <span className="item-price">NPR 1,399</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Pasta Bolognese')}>Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CDFReservationsTab = ({ reservations, updateReservationStatus }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredReservations = activeFilter === 'all' 
    ? reservations 
    : reservations.filter(res => res.status === activeFilter);

  const handleStatusChange = (reservationId, newStatus) => {
    updateReservationStatus(reservationId, newStatus);
  };

  const todayReservations = reservations.filter(res => {
    const resDate = new Date(res.date).toDateString();
    const today = new Date().toDateString();
    return resDate === today;
  });

  return (
    <div className="reservations-tab">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Table Reservations ({reservations.length})</h2>
        <button 
          onClick={() => {
            const testReservation = {
              tenantId: 'cdf',
              tenantName: 'CDF Bistro',
              customerName: 'Test Customer',
              customerEmail: 'test@cdf.com',
              customerPhone: '+977-9800000000',
              date: new Date().toISOString().split('T')[0],
              time: '7:00 PM',
              guests: '4',
              specialRequests: 'Test reservation'
            };
            console.log('Creating test reservation for CDF:', testReservation);
            // This would need access to addReservation from context
            alert('Test reservation data logged to console');
          }}
          className="action-btn"
          style={{fontSize: '0.875rem', padding: '0.5rem 1rem'}}
        >
          Test Reservation
        </button>
      </div>
      
      <div className="reservation-stats">
        <div className="stat-card">
          <h4>Today's Reservations</h4>
          <p className="stat-number">{todayReservations.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total Reservations</h4>
          <p className="stat-number">{reservations.length}</p>
        </div>
        <div className="stat-card">
          <h4>Confirmed</h4>
          <p className="stat-number">{reservations.filter(r => r.status === 'confirmed').length}</p>
        </div>
      </div>

      <div className="orders-filter" style={{marginTop: '2rem'}}>
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({reservations.length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('confirmed')}
        >
          Confirmed ({reservations.filter(r => r.status === 'confirmed').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          Cancelled ({reservations.filter(r => r.status === 'cancelled').length})
        </button>
      </div>
      
      {filteredReservations.length === 0 ? (
        <div className="empty-state">
          <p>No reservations found</p>
          <p className="empty-state-subtitle">Reservations will appear here when customers book tables</p>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map(reservation => (
            <div key={reservation.id} className="reservation-item-card">
              <div className="order-header">
                <span className="order-id">{reservation.id}</span>
                <span className={`status ${reservation.status}`}>{reservation.status}</span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {reservation.customerName}</p>
                <p><strong>Phone:</strong> {reservation.customerPhone}</p>
                <p><strong>Email:</strong> {reservation.customerEmail}</p>
                <p><strong>Date:</strong> {reservation.date}</p>
                <p><strong>Time:</strong> {reservation.time}</p>
                <p><strong>Guests:</strong> {reservation.guests}</p>
                {reservation.specialRequests && (
                  <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>
                )}
                <p><strong>Booked:</strong> {new Date(reservation.createdAt).toLocaleString()}</p>
              </div>
              <div className="order-actions">
                {reservation.status === 'confirmed' && (
                  <>
                    <button 
                      className="action-btn" 
                      onClick={() => handleStatusChange(reservation.id, 'seated')}
                    >
                      Mark as Seated
                    </button>
                    <button 
                      className="action-btn btn-danger" 
                      onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {reservation.status === 'seated' && (
                  <button 
                    className="action-btn" 
                    onClick={() => handleStatusChange(reservation.id, 'completed')}
                  >
                    Mark Complete
                  </button>
                )}
                {(reservation.status === 'completed' || reservation.status === 'cancelled') && (
                  <span className="completed-badge">
                    {reservation.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CDFSettingsTab = ({ navigate }) => {
  const handleSaveRestaurantInfo = () => {
    alert('Restaurant information saved successfully!');
  };

  const handleToggleReservations = (enabled) => {
    alert(`Online reservations ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleExportData = () => {
    alert('Exporting CDF Bistro data...');
  };

  const handleViewAnalytics = () => {
    alert('Opening detailed analytics...');
  };

  return (
    <div className="settings-tab">
      <h2>CDF Bistro Settings</h2>
      <div className="settings-section">
        <h3>Restaurant Information</h3>
        <div className="form-group">
          <label>Restaurant Name</label>
          <input type="text" defaultValue="CDF Bistro" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" defaultValue="Thamel, Kathmandu" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" defaultValue="+977-1-4445678" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" defaultValue="info@cdf.restro24.com" />
        </div>
        <button className="action-btn" onClick={handleSaveRestaurantInfo}>Save Information</button>
      </div>
      
      <div className="settings-section">
        <h3>Reservation Settings</h3>
        <div className="form-group">
          <label>
            <input type="checkbox" defaultChecked onChange={(e) => handleToggleReservations(e.target.checked)} />
            Enable Online Reservations
          </label>
        </div>
        <div className="form-group">
          <label>Maximum Party Size</label>
          <input type="number" defaultValue="8" />
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Quick Links</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.open('/restaurants/cdf', '_blank')}>
            View Public Website
          </button>
          <button className="action-btn" onClick={() => navigate('/order')}>
            View Ordering Page
          </button>
          <button className="action-btn" onClick={() => navigate('/pos')}>
            Open POS System
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={handleExportData}>Export Data</button>
          <button className="action-btn" onClick={handleViewAnalytics}>View Analytics</button>
        </div>
      </div>
    </div>
  );
};

export default CDFDashboard;