import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, reservations, getOrdersByTenant, getReservationsByTenant } = useOrders();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [selectedTenant, setSelectedTenant] = useState(location.state?.tenant || 'all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
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

  const handleTenantChange = (tenant) => {
    setIsLoading(true);
    setSelectedTenant(tenant);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'overview':
          return <AdminOverviewTab selectedTenant={selectedTenant} lastUpdated={lastUpdated} orders={orders} reservations={reservations} getOrdersByTenant={getOrdersByTenant} getReservationsByTenant={getReservationsByTenant} navigate={navigate} />;
        case 'restaurants':
          return <RestaurantsTab orders={orders} reservations={reservations} getOrdersByTenant={getOrdersByTenant} getReservationsByTenant={getReservationsByTenant} navigate={navigate} />;
        case 'analytics':
          return <AnalyticsTab selectedTenant={selectedTenant} orders={orders} reservations={reservations} getOrdersByTenant={getOrdersByTenant} />;
        case 'settings':
          return <AdminSettingsTab />;
        default:
          return <AdminOverviewTab selectedTenant={selectedTenant} lastUpdated={lastUpdated} orders={orders} reservations={reservations} getOrdersByTenant={getOrdersByTenant} getReservationsByTenant={getReservationsByTenant} navigate={navigate} />;
      }
    })();

    return (
      <div className={isLoading ? 'loading' : ''}>
        {content}
      </div>
    );
  };

  return (
    <div className="dashboard admin-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Restro24 Admin Dashboard</h1>
          <span className="tenant-badge">Super Admin</span>
        </div>
        <div className="header-right">
          <div className="tenant-selector">
            <select 
              value={selectedTenant} 
              onChange={(e) => handleTenantChange(e.target.value)}
            >
              <option value="all">All Restaurants</option>
              <option value="bcd">BCD Restaurant</option>
              <option value="cdf">CDF Bistro</option>
            </select>
          </div>
          <span>Welcome, {user?.name}</span>
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
            className={activeTab === 'restaurants' ? 'active' : ''}
            onClick={() => handleTabChange('restaurants')}
          >
            Restaurants
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => handleTabChange('analytics')}
          >
            Analytics
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

const AdminOverviewTab = ({ selectedTenant, lastUpdated, orders, reservations, getOrdersByTenant, getReservationsByTenant, navigate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get filtered data based on selected tenant
  const getFilteredOrders = () => {
    if (selectedTenant === 'all') return orders;
    return getOrdersByTenant(selectedTenant);
  };

  const getFilteredReservations = () => {
    if (selectedTenant === 'all') return reservations;
    return getReservationsByTenant(selectedTenant);
  };

  const filteredOrders = getFilteredOrders();
  const filteredReservations = getFilteredReservations();

  // Calculate today's data
  const todayOrders = filteredOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const todayReservations = filteredReservations.filter(res => {
    const resDate = new Date(res.date).toDateString();
    const today = new Date().toDateString();
    return resDate === today;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleViewAllOrders = () => {
    if (selectedTenant === 'bcd') {
      navigate('/admin/bcd');
    } else if (selectedTenant === 'cdf') {
      navigate('/admin/cdf');
    } else {
      // Show all orders in current view
      alert('Viewing all orders from all restaurants. Select a specific restaurant to manage orders.');
    }
  };

  const handleRestaurantAnalytics = () => {
    // Switch to analytics tab
    navigate('/admin', { state: { tab: 'analytics' } });
  };

  const handleManageTenants = () => {
    // Switch to restaurants tab
    navigate('/admin', { state: { tab: 'restaurants' } });
  };

  const handleSystemSettings = () => {
    // Switch to settings tab
    navigate('/admin', { state: { tab: 'settings' } });
  };

  return (
    <div className="overview-tab">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <h2>
          {selectedTenant === 'all' ? 'All Restaurants' : 
           selectedTenant === 'bcd' ? 'BCD Restaurant' : 'CDF Bistro'} Overview
        </h2>
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
          <span className="stat-change positive">+{filteredOrders.length > 0 ? Math.round((todayRevenue / filteredOrders.length) * 100) / 100 : 0}% avg</span>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{filteredOrders.length}</p>
          <span className="stat-change">All time</span>
        </div>
        <div className="stat-card">
          <h3>Today's Reservations</h3>
          <p className="stat-number">{todayReservations.length}</p>
          <span className="stat-change positive">{filteredReservations.filter(r => r.status === 'confirmed').length} confirmed</span>
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
                <span className="order-tenant">{order.tenantName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RestaurantsTab = ({ orders, reservations, getOrdersByTenant, getReservationsByTenant, navigate }) => {
  const bcdOrders = getOrdersByTenant('bcd');
  const cdfOrders = getOrdersByTenant('cdf');
  const bcdReservations = getReservationsByTenant('bcd');
  const cdfReservations = getReservationsByTenant('cdf');

  // Calculate today's data for BCD
  const bcdTodayOrders = bcdOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });
  const bcdTodayRevenue = bcdTodayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // Calculate today's data for CDF
  const cdfTodayOrders = cdfOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });
  const cdfTodayRevenue = cdfTodayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const handleManageRestaurant = (tenantId) => {
    navigate(`/admin/${tenantId}`);
  };

  const handleRestaurantAnalytics = (tenantId) => {
    // Navigate to admin dashboard with analytics tab and specific tenant
    navigate('/admin', { state: { tab: 'analytics', tenant: tenantId } });
  };

  const handleRestaurantSettings = (tenantId) => {
    // Navigate to specific restaurant dashboard settings tab
    navigate(`/admin/${tenantId}`, { state: { tab: 'settings' } });
  };

  const handleAddNewRestaurant = () => {
    const name = prompt('Enter new restaurant name:');
    if (name) {
      alert(`Adding new restaurant: ${name}`);
    }
  };

  return (
    <div className="restaurants-tab">
      <h2>Restaurant Management</h2>
      <div className="restaurant-cards">
        <div className="restaurant-card">
          <div className="restaurant-header">
            <h3>BCD Restaurant</h3>
            <span className="status-badge active">Active</span>
          </div>
          <div className="restaurant-info">
            <p><strong>Location:</strong> Durbar Marg, Kathmandu</p>
            <p><strong>Manager:</strong> Star Manager</p>
            <p><strong>Domain:</strong> bcd.restro24.com</p>
            <p><strong>Features:</strong> Reservations, Online Ordering</p>
          </div>
          <div className="restaurant-stats">
            <span>{bcdTodayOrders.length} orders today</span>
            <span>NPR {bcdTodayRevenue.toLocaleString()} revenue</span>
            <span>{bcdReservations.length} reservations</span>
          </div>
          <div className="restaurant-actions">
            <button className="action-btn" onClick={() => handleManageRestaurant('bcd')}>Manage</button>
            <button className="action-btn" onClick={() => handleRestaurantAnalytics('bcd')}>Analytics</button>
            <button className="action-btn" onClick={() => handleRestaurantSettings('bcd')}>Settings</button>
          </div>
        </div>
        
        <div className="restaurant-card">
          <div className="restaurant-header">
            <h3>CDF Bistro</h3>
            <span className="status-badge active">Active</span>
          </div>
          <div className="restaurant-info">
            <p><strong>Location:</strong> Thamel, Kathmandu</p>
            <p><strong>Manager:</strong> Restaurant Manager</p>
            <p><strong>Domain:</strong> cdf.restro24.com</p>
            <p><strong>Features:</strong> Reservations, Online Ordering</p>
          </div>
          <div className="restaurant-stats">
            <span>{cdfTodayOrders.length} orders today</span>
            <span>NPR {cdfTodayRevenue.toLocaleString()} revenue</span>
            <span>{cdfReservations.length} reservations</span>
          </div>
          <div className="restaurant-actions">
            <button className="action-btn" onClick={() => handleManageRestaurant('cdf')}>Manage</button>
            <button className="action-btn" onClick={() => handleRestaurantAnalytics('cdf')}>Analytics</button>
            <button className="action-btn" onClick={() => handleRestaurantSettings('cdf')}>Settings</button>
          </div>
        </div>
      </div>
      
      <div className="add-restaurant">
        <button className="add-restaurant-btn" onClick={handleAddNewRestaurant}>+ Add New Restaurant</button>
      </div>
    </div>
  );
};

const AnalyticsTab = ({ selectedTenant, orders, reservations, getOrdersByTenant }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', data: [] });
  
  const filteredOrders = selectedTenant === 'all' ? orders : getOrdersByTenant(selectedTenant);
  
  const todayOrders = filteredOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const handleExportReport = () => {
    const reportData = {
      tenant: selectedTenant === 'all' ? 'All Restaurants' : selectedTenant.toUpperCase(),
      generatedAt: new Date().toLocaleString(),
      totalOrders: filteredOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue: totalRevenue,
      todayRevenue: todayRevenue,
      pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
      completedOrders: filteredOrders.filter(o => o.status === 'completed').length
    };
    
    const reportText = `
RESTRO24 ANALYTICS REPORT
========================
Tenant: ${reportData.tenant}
Generated: ${reportData.generatedAt}

ORDERS
------
Total Orders: ${reportData.totalOrders}
Today's Orders: ${reportData.todayOrders}
Pending: ${reportData.pendingOrders}
Completed: ${reportData.completedOrders}

REVENUE
-------
Total Revenue: NPR ${reportData.totalRevenue.toLocaleString()}
Today's Revenue: NPR ${reportData.todayRevenue.toLocaleString()}
Average Order Value: NPR ${filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restro24-analytics-${selectedTenant}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetailedReport = (type) => {
    let title = '';
    let data = [];
    
    switch(type) {
      case 'restaurants':
        title = 'Restaurant Details';
        data = selectedTenant === 'all' 
          ? ['BCD Restaurant - Active', 'CDF Bistro - Active']
          : [`${selectedTenant.toUpperCase()} - Active`];
        break;
      case 'orders':
        title = "Today's Orders";
        data = todayOrders.map(o => `${o.id} - ${o.customerName} - NPR ${o.totalAmount} - ${o.status}`);
        break;
      case 'revenue':
        title = "Today's Revenue Breakdown";
        data = todayOrders.map(o => `${o.id}: NPR ${o.totalAmount}`);
        break;
      case 'total-revenue':
        title = 'All-Time Revenue Breakdown';
        data = filteredOrders.map(o => `${o.id}: NPR ${o.totalAmount} (${new Date(o.createdAt).toLocaleDateString()})`);
        break;
      case 'revenue-trends':
        title = 'Revenue Trends Analysis';
        data = [
          `Total Orders: ${filteredOrders.length}`,
          `Average Order Value: NPR ${filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0}`,
          `Total Revenue: NPR ${totalRevenue.toLocaleString()}`,
          `Today's Revenue: NPR ${todayRevenue.toLocaleString()}`
        ];
        break;
      case 'order-volume':
        title = 'Order Volume Analysis';
        data = [
          `Pending Orders: ${filteredOrders.filter(o => o.status === 'pending').length}`,
          `In Progress: ${filteredOrders.filter(o => o.status === 'in-progress').length}`,
          `Completed: ${filteredOrders.filter(o => o.status === 'completed').length}`,
          `Total: ${filteredOrders.length}`
        ];
        break;
      default:
        title = 'Report';
        data = ['No data available'];
    }
    
    setModalContent({ title, data });
    setShowModal(true);
  };

  const handleDateRangeChange = () => {
    const startDate = prompt('Enter start date (YYYY-MM-DD):');
    if (startDate) {
      const endDate = prompt('Enter end date (YYYY-MM-DD):');
      if (endDate) {
        alert(`Date range set: ${startDate} to ${endDate}\n\nNote: This is a demo. In production, this would filter the analytics data.`);
      }
    }
  };

  return (
    <div className="analytics-tab">
      <h2>Platform Analytics - {selectedTenant === 'all' ? 'All Restaurants' : selectedTenant.toUpperCase()}</h2>
      <div style={{marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <button className="action-btn" onClick={handleDateRangeChange}>Change Date Range</button>
        <button className="action-btn" onClick={handleExportReport}>Export Report</button>
      </div>
      
      <div className="analytics-summary">
        <div className="metric-card">
          <h4>Total Restaurants</h4>
          <p className="metric-number">{selectedTenant === 'all' ? '2' : '1'}</p>
          <button className="action-btn small" onClick={() => handleViewDetailedReport('restaurants')}>Details</button>
        </div>
        <div className="metric-card">
          <h4>Total Orders (Today)</h4>
          <p className="metric-number">{todayOrders.length}</p>
          <button className="action-btn small" onClick={() => handleViewDetailedReport('orders')}>Details</button>
        </div>
        <div className="metric-card">
          <h4>Today's Revenue</h4>
          <p className="metric-number">NPR {todayRevenue.toLocaleString()}</p>
          <button className="action-btn small" onClick={() => handleViewDetailedReport('revenue')}>Details</button>
        </div>
        <div className="metric-card">
          <h4>All-Time Revenue</h4>
          <p className="metric-number">NPR {totalRevenue.toLocaleString()}</p>
          <button className="action-btn small" onClick={() => handleViewDetailedReport('total-revenue')}>Details</button>
        </div>
      </div>
      
      <div className="analytics-charts">
        <div className="chart-placeholder">
          <h4>Revenue Trends</h4>
          <p>Total Orders: {filteredOrders.length}</p>
          <p>Average Order Value: NPR {filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0}</p>
          <button className="action-btn" onClick={() => handleViewDetailedReport('revenue-trends')}>View Interactive Chart</button>
        </div>
        <div className="chart-placeholder">
          <h4>Order Volume</h4>
          <p>Pending: {filteredOrders.filter(o => o.status === 'pending').length}</p>
          <p>In Progress: {filteredOrders.filter(o => o.status === 'in-progress').length}</p>
          <p>Completed: {filteredOrders.filter(o => o.status === 'completed').length}</p>
          <button className="action-btn" onClick={() => handleViewDetailedReport('order-volume')}>View Interactive Chart</button>
        </div>
      </div>
      
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{margin: 0}}>{modalContent.title}</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >×</button>
            </div>
            <div style={{lineHeight: '1.8'}}>
              {modalContent.data.length > 0 ? (
                modalContent.data.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem',
                    background: idx % 2 === 0 ? '#f8fafc' : 'white',
                    borderRadius: '6px',
                    marginBottom: '0.5rem'
                  }}>
                    {item}
                  </div>
                ))
              ) : (
                <p style={{textAlign: 'center', color: '#64748b'}}>No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminSettingsTab = () => {
  const handleSaveSettings = () => {
    alert('Platform settings saved successfully!');
  };

  const handleEditUser = (email) => {
    alert(`Opening user editor for ${email}`);
  };

  const handleAddUser = () => {
    const email = prompt('Enter new user email:');
    if (email) {
      alert(`Adding new user: ${email}`);
    }
  };

  const handleExportData = () => {
    alert('Exporting platform data...');
  };

  const handleBackupSystem = () => {
    alert('Creating system backup...');
  };

  return (
    <div className="settings-tab">
      <h2>Platform Settings</h2>
      <div className="settings-section">
        <h3>Platform Configuration</h3>
        <div className="form-group">
          <label>Platform Name</label>
          <input type="text" defaultValue="Restro24" />
        </div>
        <div className="form-group">
          <label>Support Email</label>
          <input type="email" defaultValue="support@restro24.com" />
        </div>
        <button className="action-btn" onClick={handleSaveSettings}>Save Settings</button>
      </div>
      
      <div className="settings-section">
        <h3>User Management</h3>
        <div className="user-list">
          <div className="user-item">
            <span>admin@restro.com</span>
            <span className="role-badge admin">Admin</span>
            <button className="action-btn small" onClick={() => handleEditUser('admin@restro.com')}>Edit</button>
          </div>
          <div className="user-item">
            <span>star@scb.com</span>
            <span className="role-badge manager">BCD Manager</span>
            <button className="action-btn small" onClick={() => handleEditUser('star@scb.com')}>Edit</button>
          </div>
          <div className="user-item">
            <span>manager@dt.com</span>
            <span className="role-badge manager">CDF Manager</span>
            <button className="action-btn small" onClick={() => handleEditUser('manager@dt.com')}>Edit</button>
          </div>
        </div>
        <button className="action-btn" onClick={handleAddUser} style={{marginTop: '1rem'}}>+ Add New User</button>
      </div>
      
      <div className="settings-section">
        <h3>System Information</h3>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Last Updated:</strong> January 25, 2026</p>
        <p><strong>Active Tenants:</strong> 2</p>
        <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
          <button className="action-btn" onClick={handleExportData}>Export Data</button>
          <button className="action-btn" onClick={handleBackupSystem}>Backup System</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;