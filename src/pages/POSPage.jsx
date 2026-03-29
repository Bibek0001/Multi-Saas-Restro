import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import '../styles/POSPage.css';

const POSPage = () => {
  const { tenant } = useTenant();
  const { user, logout } = useAuth();
  const { addOrder, getOrdersByTenant, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [activeTab, setActiveTab] = useState('pos');
  const [orderFilter, setOrderFilter] = useState('all');
  
  // Get tenant ID from user or tenant context
  const tenantId = user?.tenantId || tenant?.id || 'central';
  
  // Get orders for this tenant
  const tenantOrders = getOrdersByTenant(tenantId);
  const posOrders = tenantOrders.filter(order => order.orderType === 'dine-in');

  // Menu items based on tenant
  const getMenuItems = () => {
    const baseMenu = [
      { id: 1, name: 'Signature Burger', price: 699, category: 'Mains' },
      { id: 2, name: 'Caesar Salad', price: 499, category: 'Salads' },
      { id: 3, name: 'Grilled Salmon', price: 999, category: 'Mains' },
      { id: 4, name: 'Margherita Pizza', price: 799, category: 'Pizza' },
      { id: 5, name: 'Chocolate Cake', price: 399, category: 'Desserts' },
      { id: 6, name: 'Pasta Carbonara', price: 799, category: 'Mains' },
      { id: 7, name: 'French Fries', price: 299, category: 'Sides' },
      { id: 8, name: 'Iced Coffee', price: 349, category: 'Beverages' },
      { id: 9, name: 'Tiramisu', price: 449, category: 'Desserts' },
      { id: 10, name: 'Chicken Wings', price: 599, category: 'Appetizers' }
    ];
    return baseMenu;
  };

  const menuItems = getMenuItems();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Table management
  const tables = Array.from({ length: 12 }, (_, i) => {
    const tableId = i + 1;
    const hasActiveOrder = posOrders.some(order => 
      order.tableNumber === tableId && 
      (order.status === 'pending' || order.status === 'in-progress')
    );
    return {
      id: tableId,
      status: hasActiveOrder ? 'occupied' : 'available'
    };
  });

  const addToOrder = (item) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemId) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  const updateOrderQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromOrder(itemId);
    } else {
      setCurrentOrder(currentOrder.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = () => {
    if (currentOrder.length === 0) {
      alert('Please add items to the order');
      return;
    }

    if (!selectedTable) {
      alert('Please select a table');
      return;
    }

    const orderData = {
      tenantId: tenantId,
      customerName: customerName || `Table ${selectedTable}`,
      customerPhone: customerPhone || 'N/A',
      customerEmail: 'pos@restaurant.com',
      deliveryType: 'dine-in',
      orderType: 'dine-in',
      tableNumber: selectedTable,
      items: currentOrder,
      itemCount: currentOrder.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: getOrderTotal()
    };

    console.log('Creating POS order:', orderData);
    const createdOrder = addOrder(orderData);
    console.log('Order created:', createdOrder);
    console.log('Current tenant orders after creation:', getOrdersByTenant(tenantId));
    
    setCurrentOrder([]);
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
    alert(`Order sent to kitchen for Table ${selectedTable}!`);
  };

  const handleOrderStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const clearOrder = () => {
    if (currentOrder.length > 0) {
      if (window.confirm('Clear current order?')) {
        setCurrentOrder([]);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    if (tenantId === 'bcd') {
      navigate('/admin/bcd');
    } else if (tenantId === 'cdf') {
      navigate('/admin/cdf');
    } else {
      navigate('/admin');
    }
  };

  // Filter orders based on selected filter
  const getFilteredOrders = () => {
    if (orderFilter === 'all') return posOrders;
    return posOrders.filter(order => order.status === orderFilter);
  };

  const filteredOrders = getFilteredOrders();

  // Get filtered menu items
  const getFilteredMenuItems = () => {
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  };

  const filteredMenuItems = getFilteredMenuItems();

  // Calculate active orders count (pending + in-progress)
  const activeOrdersCount = posOrders.filter(o => o.status === 'pending' || o.status === 'in-progress').length;
  
  // Calculate total revenue from all completed orders
  const totalRevenue = posOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Calculate pending orders count
  const pendingOrdersCount = posOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="pos-page">
      <header className="pos-header">
        <div className="header-left">
          <h1>{tenant?.name || 'Restaurant'} - Point of Sale</h1>
          <span className="tenant-badge">{user?.name}</span>
        </div>
        <div className="pos-stats">
          <span>Active Orders: {activeOrdersCount}</span>
          <span>Current: NPR {getOrderTotal().toLocaleString()}</span>
          <button onClick={handleBackToDashboard} className="back-button">
            Back to Dashboard
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="pos-tabs">
        <button 
          className={`pos-tab ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
        >
          POS System
        </button>
        <button 
          className={`pos-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Kitchen Orders ({posOrders.length})
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="pos-content">
          <div className="pos-left">
            <div className="table-selection">
              <h3>Select Table</h3>
              <div className="tables-grid">
                {tables.map(table => (
                  <button
                    key={table.id}
                    className={`table-button ${table.status} ${selectedTable === table.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    Table {table.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-selection">
              <h3>Menu Items</h3>
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="menu-grid">
                {filteredMenuItems.map(item => (
                  <button
                    key={item.id}
                    className="menu-item-button"
                    onClick={() => addToOrder(item)}
                  >
                    <div className="item-name">{item.name}</div>
                    <div className="item-category">{item.category}</div>
                    <div className="item-price">NPR {item.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pos-center">
            <div className="current-order">
              <div className="order-header-section">
                <h3>Current Order - Table {selectedTable || '?'}</h3>
                {currentOrder.length > 0 && (
                  <button onClick={clearOrder} className="clear-order-btn">
                    Clear
                  </button>
                )}
              </div>
              
              <div className="customer-info-section">
                <input
                  type="text"
                  placeholder="Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="customer-input"
                />
                <input
                  type="tel"
                  placeholder="Phone (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="customer-input"
                />
              </div>

              {currentOrder.length === 0 ? (
                <p className="empty-order">No items added. Select items from the menu.</p>
              ) : (
                <>
                  <div className="order-items">
                    {currentOrder.map(item => (
                      <div key={item.id} className="order-item">
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">NPR {item.price} × {item.quantity}</span>
                        </div>
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateOrderQuantity(item.id, item.quantity - 1)}
                            className="qty-button"
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            onClick={() => updateOrderQuantity(item.id, item.quantity + 1)}
                            className="qty-button"
                          >
                            +
                          </button>
                        </div>
                        <div className="item-subtotal">NPR {item.price * item.quantity}</div>
                        <button 
                          onClick={() => removeFromOrder(item.id)}
                          className="remove-item-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Items:</span>
                      <span>{currentOrder.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>NPR {getOrderTotal()}</span>
                    </div>
                  </div>
                  
                  <button onClick={submitOrder} className="submit-order-button">
                    Send to Kitchen
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="pos-right">
            <div className="active-orders">
              <h3>Recent Kitchen Orders</h3>
              {posOrders.slice(0, 5).map(order => (
                <div key={order.id} className={`order-card ${order.status}`}>
                  <div className="order-header">
                    <span>Table {order.tableNumber}</span>
                    <span className="order-status">{order.status}</span>
                  </div>
                  <div className="order-info">
                    <small>{order.customerName}</small>
                    <small>{new Date(order.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <div className="order-items-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-summary">
                        {item.quantity}× {item.name}
                      </div>
                    ))}
                  </div>
                  <div className="order-total-small">NPR {order.totalAmount}</div>
                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleOrderStatusUpdate(order.id, 'in-progress')}
                        className="status-button ready"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'in-progress' && (
                      <button 
                        onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                        className="status-button served"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {posOrders.length === 0 && (
                <p className="empty-state">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="orders-management-panel">
          <div className="orders-filter-section">
            <h2>Kitchen Orders Management</h2>
            <div className="orders-filter">
              <button 
                className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
                onClick={() => setOrderFilter('all')}
              >
                All ({posOrders.length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setOrderFilter('pending')}
              >
                Pending ({posOrders.filter(o => o.status === 'pending').length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setOrderFilter('in-progress')}
              >
                In Progress ({posOrders.filter(o => o.status === 'in-progress').length})
              </button>
              <button 
                className={`filter-btn ${orderFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setOrderFilter('completed')}
              >
                Completed ({posOrders.filter(o => o.status === 'completed').length})
              </button>
            </div>
          </div>

          <div className="orders-grid">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <p>No orders found</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className={`order-card-full ${order.status}`}>
                  <div className="order-card-header">
                    <div>
                      <h4>Table {order.tableNumber}</h4>
                      <p className="order-id">{order.id}</p>
                    </div>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-meta">
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p><strong>Phone:</strong> {order.customerPhone}</p>
                      <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="order-items-detail">
                      <strong>Items:</strong>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <span>{item.quantity}× {item.name}</span>
                          <span>NPR {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total-row">
                      <strong>Total:</strong>
                      <strong>NPR {order.totalAmount}</strong>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    {order.status === 'pending' && (
                      <button 
                        className="action-btn primary" 
                        onClick={() => handleOrderStatusUpdate(order.id, 'in-progress')}
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'in-progress' && (
                      <button 
                        className="action-btn success" 
                        onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                      >
                        Mark Complete
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="completed-badge">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;