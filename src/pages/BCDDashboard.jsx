import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import '../styles/Dashboard.css';

const BCDDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, reservations, updateOrderStatus, updateReservationStatus } = useOrders();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const tenantId = 'bcd';
  
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
      console.log('Auto-refresh triggered for BCD Dashboard');
    }, 2000); // Reduced from 5000 to 2000 for faster updates

    return () => clearInterval(interval);
  }, []);

  // Also refresh when window gains focus (user switches back to this tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('BCD Dashboard gained focus, refreshing data');
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
          return <BCDOverviewTab orders={tenantOrders} reservations={todayReservations} navigate={navigate} />;
        case 'reservations':
          return <BCDReservationsTab reservations={tenantReservations} updateReservationStatus={updateReservationStatus} />;
        case 'menu':
          return <BCDMenuTab />;
        case 'settings':
          return <BCDSettingsTab navigate={navigate} />;
        default:
          return <BCDOverviewTab orders={tenantOrders} reservations={todayReservations} navigate={navigate} />;
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
    <div className="dashboard bcd-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>BCD Restaurant Dashboard</h1>
          <span className="tenant-badge">BCD Manager</span>
        </div>
        <div className="header-right">
          {pendingOrders > 0 && (
            <div className="notification-badge" title={`${pendingOrders} pending orders`}>
              {pendingOrders}
            </div>
          )}
          <span>Welcome, {user?.name}</span>
          <a href="https://restro24.com" target="_blank" rel="noopener noreferrer" className="restro-link">
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
            className={activeTab === 'reservations' ? 'active' : ''}
            onClick={() => handleTabChange('reservations')}
          >
            Reservations {todayReservations.length > 0 && `(${todayReservations.length})`}
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

const BCDOverviewTab = ({ orders, reservations, navigate }) => {
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
    navigate('/restaurants/bcd');
  };

  const handlePOS = () => {
    navigate('/pos');
  };

  return (
    <div className="overview-tab">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <h2>BCD Restaurant Overview</h2>
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
        <div className="stat-card">
          <h3>Today's Reservations</h3>
          <p className="stat-number">{reservations.length}</p>
          <span className="stat-change positive">{reservations.filter(r => r.status === 'confirmed').length} confirmed</span>
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

const BCDOrdersTab = ({ orders, updateOrderStatus }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="orders-tab">
      <h2>BCD Restaurant Orders ({orders.length})</h2>
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
                <span className="order-id">{order.id}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Email:</strong> {order.customerEmail}</p>
                <p><strong>Type:</strong> {order.deliveryType}</p>
                {order.deliveryAddress && <p><strong>Address:</strong> {order.deliveryAddress}</p>}
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
                  <button 
                    className="action-btn" 
                    onClick={() => handleStatusChange(order.id, 'completed')}
                  >
                    Mark Complete
                  </button>
                )}
                {order.status === 'completed' && (
                  <span className="completed-badge">Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BCDMenuTab = () => {
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
      <h2>BCD Restaurant Menu</h2>
      <div className="menu-actions">
        <button className="add-item-button" onClick={handleAddNewItem}>+ Add New Item</button>
        <button className="import-button" onClick={handleImportMenu}>Import Menu</button>
      </div>
      <div className="menu-categories">
        <div className="category-section">
          <h3>Main Dishes</h3>
          <div className="menu-items">
            <div className="menu-item">
              <span className="item-name">Signature Burger</span>
              <span className="item-price">NPR 699</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Signature Burger')}>Edit</button>
            </div>
            <div className="menu-item">
              <span className="item-name">Grilled Salmon</span>
              <span className="item-price">NPR 999</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Grilled Salmon')}>Edit</button>
            </div>
            <div className="menu-item">
              <span className="item-name">Caesar Salad</span>
              <span className="item-price">NPR 499</span>
              <span className="item-status available">Available</span>
              <button className="edit-btn" onClick={() => handleEditItem('Caesar Salad')}>Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BCDReservationsTab = ({ reservations, updateReservationStatus }) => {
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
      <h2>Table Reservations ({reservations.length})</h2>
      
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

const BCDSettingsTab = ({ navigate }) => {
  const handleSaveRestaurantInfo = () => {
    alert('Restaurant information saved successfully!');
  };

  const handleToggleReservations = (enabled) => {
    alert(`Online reservations ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleExportData = () => {
    alert('Exporting BCD Restaurant data...');
  };

  const handleViewAnalytics = () => {
    alert('Opening detailed analytics...');
  };

  return (
    <div className="settings-tab">
      <h2>BCD Restaurant Settings</h2>
      <div className="settings-section">
        <h3>Restaurant Information</h3>
        <div className="form-group">
          <label>Restaurant Name</label>
          <input type="text" defaultValue="BCD Restaurant" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" defaultValue="Durbar Marg, Kathmandu" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" defaultValue="+977-1-4441234" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" defaultValue="info@bcd.restro24.com" />
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
          <input type="number" defaultValue="10" />
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Quick Links</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.open('/restaurants/bcd', '_blank')}>
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

export default BCDDashboard;
