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
      <header className="ordering-header">
        <div className="header-content">
          <h1>Order from {currentTenant?.name || 'Restro24'}</h1>
          {currentTenant?.isSubdomain && (
            <a href="https://restro24web.netlify.app" target="_blank" rel="noopener noreferrer" className="restro-platform-link">
              Restro24 Platform
            </a>
          )}
        </div>
      </header>

      <div className="ordering-content">
        <div className="menu-section">
          <div className="section-header">
            <h2>Our Menu</h2>
            <p className="section-subtitle">Choose from our delicious selection</p>
          </div>
          
          <div className="menu-categories">
            {categories.map(category => (
              <button 
                key={category} 
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="menu-items-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-item-card">
                <div className="item-image">{item.image}</div>
                <h3>{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-category">{item.category}</p>
                <div className="item-footer">
                  <span className="item-price">NPR {item.price}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="add-to-cart-button"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">Cart</div>
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
                
                <div className="delivery-type">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={customerInfo.deliveryType === 'delivery'}
                      onChange={(e) => setCustomerInfo({...customerInfo, deliveryType: e.target.value})}
                    />
                    <span>Delivery</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={customerInfo.deliveryType === 'pickup'}
                      onChange={(e) => setCustomerInfo({...customerInfo, deliveryType: e.target.value})}
                    />
                    <span>Pickup</span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Full Name *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  required
                />
                {customerInfo.deliveryType === 'delivery' && (
                  <textarea
                    placeholder="Delivery Address *"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    required
                    rows="3"
                  />
                )}
                <button type="submit" className="place-order-button">
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