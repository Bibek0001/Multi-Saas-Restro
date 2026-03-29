import React, { useState } from 'react';
import '../styles/PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, order, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      // Wait 2 seconds to show success message, then complete
      setTimeout(() => {
        onPaymentComplete(paymentMethod);
        handleClose();
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setPaymentMethod('');
    setPaymentSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="payment-modal-overlay" onClick={handleClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {!paymentSuccess ? (
          <>
            <div className="payment-header">
              <h2>Process Payment</h2>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="payment-body">
              <div className="order-summary-section">
                <h3>Order Summary</h3>
                <div className="summary-details">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Items:</strong> {order.itemCount}</p>
                </div>
                <div className="order-items-summary">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="item-summary-row">
                      <span>{item.quantity}× {item.name}</span>
                      <span>NPR {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="total-amount">
                  <strong>Total Amount:</strong>
                  <strong className="amount">NPR {order.totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="payment-method-section">
                <h3>Select Payment Method</h3>
                <div className="payment-methods">
                  <div 
                    className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="payment-info">
                      <h4>Cash</h4>
                      <p>Pay with cash</p>
                    </div>
                    {paymentMethod === 'cash' && <div className="check-mark">✓</div>}
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <div className="payment-info">
                      <h4>Digital Wallet</h4>
                      <p>eSewa, Khalti, etc.</p>
                    </div>
                    {paymentMethod === 'wallet' && <div className="check-mark">✓</div>}
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="payment-info">
                      <h4>Card</h4>
                      <p>Credit/Debit card</p>
                    </div>
                    {paymentMethod === 'card' && <div className="check-mark">✓</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-footer">
              <button className="cancel-btn" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </button>
              <button 
                className="pay-btn" 
                onClick={handlePayment}
                disabled={!paymentMethod || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay NPR ${order.totalAmount.toLocaleString()}`}
              </button>
            </div>
          </>
        ) : (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Payment of NPR {order.totalAmount.toLocaleString()} received</p>
            <p className="payment-method-info">via {paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'wallet' ? 'Digital Wallet' : 'Card'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
