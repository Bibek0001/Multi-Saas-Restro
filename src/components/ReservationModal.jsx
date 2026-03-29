import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useTenant } from '../context/TenantContext';
import '../styles/ReservationModal.css';

const ReservationModal = ({ isOpen, onClose, restaurantName, tenantId }) => {
  const { addReservation } = useOrders();
  const { tenant } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add reservation to context
    const reservationData = {
      tenantId: tenantId || tenant?.id || 'bcd',
      tenantName: restaurantName || tenant?.name || 'Restaurant',
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      specialRequests: formData.specialRequests
    };

    console.log('Creating reservation:', reservationData);
    const newReservation = addReservation(reservationData);
    console.log('Reservation created:', newReservation);
    setReservationId(newReservation.id);
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 4 seconds and close modal
    setTimeout(() => {
      setSubmitted(false);
      setReservationId('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        specialRequests: ''
      });
      onClose();
    }, 4000);
  };

  const timeSlots = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', 
    '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ];

  const guestOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

  if (!isOpen) return null;

  return (
    <div className="reservation-modal-overlay" onClick={onClose}>
      <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reserve a Table</h2>
          <p>at {restaurantName}</p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">OK</div>
            <h3>Reservation Confirmed!</h3>
            <p className="reservation-id">Reservation ID: <strong>{reservationId}</strong></p>
            <p>Thank you for your reservation. We've sent a confirmation email to {formData.email}</p>
            <p className="reservation-details">
              <strong>{formData.date}</strong> at <strong>{formData.time}</strong> for <strong>{formData.guests} {formData.guests === '1' ? 'guest' : 'guests'}</strong>
            </p>
            <p className="success-note">We look forward to serving you!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(977) 9000000000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="guests">Number of Guests *</label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                >
                  {guestOptions.map(option => (
                    <option key={option} value={option}>{option} {option === '1' ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Preferred Time *</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder="Any special dietary requirements, celebrations, or seating preferences..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationModal;