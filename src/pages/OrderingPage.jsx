import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { useOrders } from '../context/OrderContext';
import '../styles/OrderingPage.css';

const OrderingPage = () => {
  const { tenant } = useTenant();
  const location = useLocation();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  
  // Get tenant from location state (passed from restaurant pages) or from context
  const currentTenant = location.state?.tenant || tenant;

  // Theme based on tenant
  const tenantId = currentTenant?.id || '';
  const theme = tenantId === 'bcd'
    ? { primary: '#dc2626', dark: '#b91c1c', light: '#fee2e2', gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626, #ef4444)' }
    : tenantId === 'cdf'
    ? { primary: '#059669', dark: '#047857', light: '#d1fae5', gradient: 'linear-gradient(135deg, #064e3b, #059669, #10b981)' }
    : { primary: '#4f46e5', dark: '#4338ca', light: '#eef2ff', gradient: 'linear-gradient(135deg, #1e1b4b, #4f46e5, #0891b2)' };
  
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryType: 'delivery'
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateOrderForm = () => {
    const errors = {};
    if (!customerInfo.name.trim()) errors.name = 'Full name is required';
    else if (customerInfo.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!customerInfo.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s]{7,15}$/.test(customerInfo.phone.trim())) errors.phone = 'Enter a valid phone number';

    if (!customerInfo.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) errors.email = 'Enter a valid email address';

    if (customerInfo.deliveryType === 'delivery' && !customerInfo.address.trim())
      errors.address = 'Delivery address is required';

    if (cart.length === 0) errors.cart = 'Please add at least one item to your cart';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced menu items with more details
  const menuItems = [
    { id: 1, name: 'Signature Burger', price: 699, category: 'Mains', description: 'Juicy beef patty with fresh vegetables', image: '' },
    { id: 2, name: 'Caesar Salad', price: 499, category: 'Salads', description: 'Fresh romaine with caesar dressing', image: '' },
    { id: 3, name: 'Grilled Salmon', price: 999, category: 'Mains', description: 'Fresh Atlantic salmon with herbs', image: '' },
    { id: 4, name: 'Margherita Pizza', price: 799, category: 'Pizza', description: 'Classic tomato and mozzarella', image: '' },
    { id: 5, name: 'Chocolate Cake', price: 399, category: 'Desserts', description: 'Rich chocolate layer cake', image: '' },
    { id: 6, name: 'Pepperoni Pizza', price: 899, category: 'Pizza', description: 'Loaded with pepperoni', image: '' },
    { id: 7, name: 'Greek Salad', price: 549, category: 'Salads', description: 'Fresh vegetables with feta', image: '' },
    { id: 8, name: 'Chicken Wings', price: 649, category: 'Mains', description: 'Crispy buffalo wings', image: '' },
    { id: 9, name: 'Ice Cream Sundae', price: 299, category: 'Desserts', description: 'Vanilla ice cream with toppings', image: '' },
    { id: 10, name: 'Pasta Carbonara', price: 749, category: 'Mains', description: 'Creamy pasta with bacon', image: '' }
  ];

  const categoryColors = {
    Mains: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    Salads: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    Pizza: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    Desserts: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    All: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)'
  };

  const categoryInitials = {
    Mains: 'M', Salads: 'S', Pizza: 'P', Desserts: 'D'
  };

  const categories = ['All', 'Mains', 'Salads', 'Pizza', 'Desserts'];

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!validateOrderForm()) return;
    
    const orderData = {
      tenantId: currentTenant?.id || 'general',
      tenantName: currentTenant?.name || 'Restro24',
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      deliveryAddress: customerInfo.address,
      deliveryType: customerInfo.deliveryType,
      orderType: 'online',
      items: cart,
      totalAmount: getTotalPrice(),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };

    console.log('Creating online order:', orderData);
    const newOrder = addOrder(orderData);
    console.log('Online order created:', newOrder);
    setSubmittedOrderId(newOrder.id);
    setOrderSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setCart([]);
      setCustomerInfo({
        name: '',
        phone: '',
        email: '',
        address: '',
        deliveryType: 'delivery'
      });
      setOrderSubmitted(false);
      setSubmittedOrderId('');
    }, 5000);
  };

  if (orderSubmitted) {
    return (
      <div className="ordering-page">
        <div className="order-success-container">
          <div className="success-animation">
            <div className="success-checkmark">OK</div>
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="order-id">Order ID: <strong>{submittedOrderId}</strong></p>
          <p className="success-message">
            Thank you for your order! We've sent a confirmation to {customerInfo.email}
          </p>
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>NPR {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <strong>Total:</strong>
              <strong>NPR {getTotalPrice()}</strong>
            </div>
          </div>
          <div className="success-actions">
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to Home
            </button>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ordering-page">
      <header className="ordering-header" style={{background: theme.gradient}}>
        <div className="header-content">
          <button onClick={() => window.history.back()} className="header-back-btn">Back</button>
          <h1>Order from {currentTenant?.name || 'Restro24'}</h1>
          <div style={{width: '80px'}}></div>
        </div>
      </header>

      <div className="ordering-content">
        <div className="menu-section">
          <div className="section-header">
            <h2>Our Menu</h2>
            <p className="section-subtitle">{filteredItems.length} items available</p>
          </div>
          
          <div className="menu-categories">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
                style={activeCategory === category ? {background: theme.primary, borderColor: theme.primary, color: 'white'} : {}}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="menu-items-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-item-card">
                <div className="item-image" style={{background: categoryColors[item.category] || 'linear-gradient(135deg, #e0e7ff, #c7d2fe)'}}>
                  <span className="item-initial">{item.name.charAt(0)}</span>
                </div>
                <div className="item-body">
                  <span className="item-category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-footer">
                    <span className="item-price" style={{color: theme.primary}}>NPR {item.price}</span>
                    <button onClick={() => addToCart(item)} className="add-to-cart-button" style={{background: theme.primary}}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2 style={{borderBottom: `3px solid ${theme.primary}`}}>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon"></div>
              <p>Your cart is empty</p>
              <p className="empty-cart-subtitle">Add items from the menu to get started</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>NPR {item.price} each</p>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-button"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-button"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      <span>NPR {item.price * item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="remove-button"
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>NPR {getTotalPrice()}</span>
                </div>
                <div className="total-row">
                  <span>Delivery Fee:</span>
                  <span>NPR 50</span>
                </div>
                <div className="total-row grand-total">
                  <strong>Total:</strong>
                  <strong>NPR {getTotalPrice() + 50}</strong>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder} className="customer-form">
                <h3>Delivery Information</h3>
                {formErrors.cart && <p className="field-error">{formErrors.cart}</p>}
                
                <div className="delivery-type">
                  <label className="radio-label">
                    <input type="radio" name="deliveryType" value="delivery"
                      checked={customerInfo.deliveryType === 'delivery'}
                      onChange={(e) => setCustomerInfo({...customerInfo, deliveryType: e.target.value})}
                    />
                    <span>Delivery</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="deliveryType" value="pickup"
                      checked={customerInfo.deliveryType === 'pickup'}
                      onChange={(e) => setCustomerInfo({...customerInfo, deliveryType: e.target.value})}
                    />
                    <span>Pickup</span>
                  </label>
                </div>

                <div className="field-group">
                  <input type="text" placeholder="Full Name *"
                    value={customerInfo.name}
                    onChange={(e) => { setCustomerInfo({...customerInfo, name: e.target.value}); setFormErrors({...formErrors, name: ''}); }}
                    className={formErrors.name ? 'input-error' : ''}
                  />
                  {formErrors.name && <p className="field-error">{formErrors.name}</p>}
                </div>

                <div className="field-group">
                  <input type="tel" placeholder="Phone Number *"
                    value={customerInfo.phone}
                    onChange={(e) => { setCustomerInfo({...customerInfo, phone: e.target.value}); setFormErrors({...formErrors, phone: ''}); }}
                    className={formErrors.phone ? 'input-error' : ''}
                  />
                  {formErrors.phone && <p className="field-error">{formErrors.phone}</p>}
                </div>

                <div className="field-group">
                  <input type="email" placeholder="Email *"
                    value={customerInfo.email}
                    onChange={(e) => { setCustomerInfo({...customerInfo, email: e.target.value}); setFormErrors({...formErrors, email: ''}); }}
                    className={formErrors.email ? 'input-error' : ''}
                  />
                  {formErrors.email && <p className="field-error">{formErrors.email}</p>}
                </div>

                {customerInfo.deliveryType === 'delivery' && (
                  <div className="field-group">
                    <textarea placeholder="Delivery Address *"
                      value={customerInfo.address}
                      onChange={(e) => { setCustomerInfo({...customerInfo, address: e.target.value}); setFormErrors({...formErrors, address: ''}); }}
                      rows="3"
                      className={formErrors.address ? 'input-error' : ''}
                    />
                    {formErrors.address && <p className="field-error">{formErrors.address}</p>}
                  </div>
                )}

                <button type="submit" className="place-order-button"
                  style={{background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`}}>
                  Place Order - NPR {getTotalPrice() + 50}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderingPage;