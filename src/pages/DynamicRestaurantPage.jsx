import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { useTenant } from '../context/TenantContext';
import ReservationModal from '../components/ReservationModal';
import '../styles/RestaurantPage.css';

const DynamicRestaurantPage = () => {
  const { content, loading } = useWebsiteContent();
  const { tenant } = useTenant();
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading restaurant information...</p>
      </div>
    );
  }

  if (!content) {
    return <div className="error-screen">Failed to load restaurant information</div>;
  }

  const categories = ['all', ...new Set(content.menuItems.map(item => item.category))];
  
  const filteredMenuItems = content.menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const formatBusinessHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openDays = days.filter(day => !content.businessHours[day].closed);
    
    if (openDays.length === 7) {
      const hours = content.businessHours.monday;
      return `Daily: ${hours.open} - ${hours.close}`;
    }
    
    return `${openDays[0].charAt(0).toUpperCase() + openDays[0].slice(1)}-${openDays[openDays.length - 1].charAt(0).toUpperCase() + openDays[openDays.length - 1].slice(1)}: ${content.businessHours[openDays[0]].open} - ${content.businessHours[openDays[0]].close}`;
  };

  return (
    <div className="restaurant-page dynamic-theme">
      <header className="restaurant-header">
        <nav className="restaurant-nav">
          <div className="nav-brand">
            <span className="nav-title">{content.profile.name}</span>
          </div>
          <div className="nav-links">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/order" state={{ tenant }} className="order-btn">
              Order Online
            </Link>
            <Link to="/login" state={{ tenant }} className="staff-login">
              Manager Login
            </Link>
            <button 
              onClick={() => setIsReservationModalOpen(true)}
              className="reserve-btn"
            >
              Reserve Table
            </button>
          </div>
        </nav>
      </header>

      <main className="restaurant-main">
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{content.profile.name}</h1>
            <p className="hero-tagline">{content.profile.tagline}</p>
            <p className="hero-description">{content.profile.description}</p>
            <div className="hero-actions">
              <button 
                onClick={() => setIsReservationModalOpen(true)}
                className="cta-secondary"
              >
                Reserve Table
              </button>
              <a href="#menu" className="cta-tertiary">View Menu</a>
            </div>
          </div>
        </section>

        {content.specialties && content.specialties.length > 0 && (
          <section className="specialties-section">
            <div className="container">
              <h2>Our Specialties</h2>
              <div className="specialties-grid">
                {content.specialties.map((specialty, index) => (
                  <div key={index} className="specialty-item">
                    <div className="specialty-icon"></div>
                    <h3>{specialty}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="menu" className="menu-section">
          <div className="container">
            <h2>Our Menu</h2>
            
            <div className="menu-filters">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category}
                    className={selectedCategory === category ? 'active' : ''}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-count">
              Showing {filteredMenuItems.length} items
            </div>

            <div className="menu-grid">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-image">
                    <img src={item.image} alt={item.name} />
                    {!item.available && (
                      <div className="unavailable-badge">Unavailable</div>
                    )}
                  </div>
                  <div className="menu-item-content">
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                    <p>{item.description}</p>
                    <div className="menu-item-footer">
                      <span className="price">NPR {item.price}</span>
                      <button className="add-to-cart" disabled={!item.available}>
                        {item.available ? 'Add to Cart' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="no-results">
                <p>No menu items found matching your search.</p>
              </div>
            )}

            <div className="menu-cta">
              <Link to="/order" state={{ tenant }} className="view-full-menu">
                Order Online Now
              </Link>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>About {content.profile.name}</h2>
                <p>{content.profile.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container">
            <h2>Visit Us</h2>
            <div className="contact-grid">
              <div className="contact-info">
                <div className="contact-item">
                  <h3>Address</h3>
                  <p>{content.profile.address}</p>
                </div>
                <div className="contact-item">
                  <h3>Phone</h3>
                  <p>{content.profile.phone}</p>
                </div>
                <div className="contact-item">
                  <h3>Email</h3>
                  <p>{content.profile.email}</p>
                </div>
                <div className="contact-item">
                  <h3>Hours</h3>
                  <p>{formatBusinessHours()}</p>
                </div>
                {content.socialMedia && (
                  <div className="contact-item">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                      {content.socialMedia.facebook && (
                        <a href={content.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                          Facebook
                        </a>
                      )}
                      {content.socialMedia.instagram && (
                        <a href={content.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                          Instagram
                        </a>
                      )}
                      {content.socialMedia.twitter && (
                        <a href={content.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-content">
              <h2>Stay Updated</h2>
              <p>Subscribe to our newsletter for exclusive offers and updates</p>
              <form className="newsletter-form" onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing!');
              }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-button">Subscribe</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="restaurant-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <p>&copy; 2026 {content.profile.name}. All rights reserved.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="#menu">Menu</a></li>
                  <li><Link to="/order" state={{ tenant }}>Order Online</Link></li>
                  <li><button onClick={() => setIsReservationModalOpen(true)} className="footer-reserve-btn">Reserve Table</button></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Management</h4>
                <ul>
                  <li><Link to="/login" state={{ tenant }}>Manager Login</Link></li>
                  <li><a href="https://restro24web.netlify.app" target="_blank" rel="noopener noreferrer">Restro24 Platform</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Powered by <a href="https://restro24.com">Restro24</a></p>
          </div>
        </div>
      </footer>

      <ReservationModal 
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        restaurantName={content.profile.name}
        tenantId={tenant?.id}
      />
    </div>
  );
};

export default DynamicRestaurantPage;
