import React from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import '../styles/RestaurantWebsite.css';

const RestaurantWebsite = () => {
  const { tenant } = useTenant();

  if (tenant?.isCentral) {
    return <CentralLandingPage />;
  }

  // This will render for both custom domains and subdomains
  return (
    <div className="restaurant-website">
      <header className="website-header">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="nav-title">{tenant?.name}</span>
          </div>
          <div className="nav-links">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/order" className="order-button">Order Online</Link>
            <Link to="/login" className="admin-link">Manager Login</Link>
            {tenant?.isSubdomain && (
              <a href="https://restro24.com" className="restro-link">Restro24</a>
            )}
          </div>
        </nav>
      </header>

      <main className="website-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Welcome to {tenant?.name}</h1>
            <p>Experience the finest dining with our carefully crafted menu</p>
            <Link to="/order" className="cta-button">Order Now</Link>
          </div>
        </section>

        <section id="menu" className="menu-section">
          <h2>Our Menu</h2>
          <div className="menu-grid">
            <div className="menu-item-card">
              <h3>Signature Burger</h3>
              <p>Juicy beef patty with fresh vegetables</p>
              <span className="price">NPR 699</span>
            </div>
            <div className="menu-item-card">
              <h3>Caesar Salad</h3>
              <p>Fresh romaine lettuce with caesar dressing</p>
              <span className="price">NPR 499</span>
            </div>
            <div className="menu-item-card">
              <h3>Grilled Salmon</h3>
              <p>Fresh Atlantic salmon with herbs</p>
              <span className="price">NPR 999</span>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <h2>About Us</h2>
          <p>
            {tenant?.name} has been serving delicious food with passion and dedication. 
            Our commitment to quality ingredients and exceptional service makes us 
            a favorite dining destination.
          </p>
        </section>

        <section id="contact" className="contact-section">
          <h2>Contact Us</h2>
          <div className="contact-info">
            <p>Address: New Road, Kathmandu 44600, Nepal</p>
            <p>Phone: +977-1-4442345</p>
            <p>Email: info@{tenant?.domain}</p>
          </div>
        </section>
      </main>

      <footer className="website-footer">
        <p>&copy; 2026 {tenant?.name}. All rights reserved.</p>
        <div className="footer-links">
          <p>Powered by <a href="https://restro24.com">Restro24</a></p>
          {tenant?.isSubdomain && (
            <div className="restro-links">
              <a href={`https://restro24.com/login?tenant=${tenant?.id}`}>
                Manager Dashboard
              </a>
              <span> | </span>
              <a href="https://restro24.com" target="_blank" rel="noopener noreferrer">
                Restro24 Platform
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

const CentralLandingPage = () => (
  <div className="central-landing">
    <header className="central-header">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-title">Restro24</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="login-button">Login</Link>
        </div>
      </nav>
    </header>

    <main className="central-main">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Multi-Tenant Restaurant Management</h1>
          <p>Manage multiple restaurants from one powerful platform</p>
          <Link to="/login" className="cta-button">Get Started</Link>
        </div>
      </section>

      <section className="restaurants-section">
        <h2>Our Partner Restaurants</h2>
        <p className="section-subtitle">Discover amazing dining experiences from our restaurant partners</p>
        <div className="restaurants-grid">
          <div className="restaurant-card">
            <div className="restaurant-header">
              <div className="restaurant-info">
                <h3>BCD Restaurant</h3>
                <p>Premium dining experience with signature dishes</p>
              </div>
            </div>
            <div className="restaurant-links">
              <Link to="/restaurants/bcd" className="visit-link">
                Visit Website
              </Link>
              <Link to="/restaurants/bcd" className="order-link">
                Reserve Table
              </Link>
              <Link to="/login?tenant=bcd" className="admin-link">
                Manager Login
              </Link>
            </div>
          </div>

          <div className="restaurant-card">
            <div className="restaurant-header">
              <div className="restaurant-info">
                <h3>CDF Bistro</h3>
                <p>Fresh, organic ingredients in a cozy atmosphere</p>
              </div>
            </div>
            <div className="restaurant-links">
              <Link to="/restaurants/cdf" className="visit-link">
                Visit Website
              </Link>
              <Link to="/order" state={{ tenant: { id: 'cdf', name: 'CDF Bistro' } }} className="order-link">
                Order Online
              </Link>
              <Link to="/login?tenant=cdf" className="admin-link">
                Manager Login
              </Link>
            </div>
          </div>
        </div>
        <div className="restaurants-footer">
          <p>Want to join our platform? <Link to="/login" className="join-link">Contact us</Link> to get started!</p>
        </div>
      </section>

      <section className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Custom Domains</h3>
            <p>Each restaurant gets its own branded subdomain</p>
          </div>
          <div className="feature-card">
            <h3>Online Ordering</h3>
            <p>Built-in ordering system for customers</p>
          </div>
          <div className="feature-card">
            <h3>POS System</h3>
            <p>Complete point-of-sale and kitchen management</p>
          </div>
          <div className="feature-card">
            <h3>Analytics</h3>
            <p>Comprehensive reporting and insights</p>
          </div>
        </div>
      </section>
    </main>
  </div>
);

export default RestaurantWebsite;