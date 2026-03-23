import React from 'react';
import '../styles/BillModal.css';

const BillModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bill-header">
          <h2>Bill sent to printer!</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="bill-content">
          <div className="bill-section">
            <h3>RESTAURANT BILL</h3>
            <div className="bill-divider">================</div>
          </div>

          <div className="bill-details">
            <p><strong>Order:</strong> {order.id}</p>
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Phone:</strong> {order.customerPhone}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            {order.isMerged && order.mergedOrderIds && (
              <p style={{color: '#f97316', fontWeight: 'bold'}}>
                MERGED FROM: {order.mergedOrderIds}
              </p>
            )}
            {order.isSplit && (
              <p style={{color: '#3b82f6', fontWeight: 'bold'}}>
                SPLIT BILL (into {order.splitParts} parts)
              </p>
            )}
          </div>

          <div className="bill-section">
            <h4>ITEMS:</h4>
            <div className="bill-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="bill-item-row">
                  <span>{item.quantity}x {item.name}</span>
                  <span>NPR {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bill-divider">----------------</div>

          <div className="bill-total">
            <span>TOTAL:</span>
            <span>NPR {order.totalAmount}</span>
          </div>

          {order.paymentStatus === 'paid' && (
            <div className="bill-payment-info">
              PAID via {order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod === 'wallet' ? 'Wallet' : 'Card'}
            </div>
          )}

          <div className="bill-divider">================</div>

          <div className="bill-footer">
            Thank you for your order!
          </div>
        </div>

        <div className="bill-modal-footer">
          <button className="ok-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
