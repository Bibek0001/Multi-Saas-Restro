import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import '../styles/RestaurantPage.css';

const BCDRestaurantPage = () => {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAllMenu, setShowAllMenu] = useState(false);

  const restaurantData = {
    id: 'bcd',
    name: 'BCD Restaurant',
    tagline: 'Premium Dining Experience',
    description: 'Experience the finest culinary artistry at BCD Restaurant, where every dish tells a story of passion, tradition, and innovation.',
    logo: '/assets/bcd-logo.png',
    heroImage: '/assets/bcd-hero.jpg',
    theme: {
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c'
    },
    specialties: [
      'Signature Wagyu Steaks',
      'Fresh Seafood Selection',
      'Artisanal Pasta Dishes',
      'Premium Wine Collection'
    ],
    menuHighlights: [
      { name: 'BCD Signature Burger', description: 'Premium wagyu beef with truffle aioli and aged cheddar', price: 'NPR 1,299', image: '/assets/bcd-burger.jpg', category: 'Burgers' },
      { name: 'Grilled Atlantic Salmon', description: 'Fresh salmon with herb butter and seasonal vegetables', price: 'NPR 1,499', image: '/assets/bcd-salmon.jpg', category: 'Seafood' },
      { name: 'Lobster Risotto', description: 'Creamy arborio rice with fresh lobster and saffron', price: 'NPR 1,699', image: '/assets/bcd-risotto.jpg', category: 'Pasta & Rice' },
      { name: 'Wagyu Ribeye Steak', description: 'Premium A5 wagyu with truffle butter and roasted garlic', price: 'NPR 2,499', image: '/assets/bcd-steak.jpg', category: 'Steaks' },
      { name: 'Truffle Pasta', description: 'Handmade fettuccine with black truffle and parmesan', price: 'NPR 1,399', image: '/assets/bcd-pasta.jpg', category: 'Pasta & Rice' },
      { name: 'Seafood Platter', description: 'Fresh prawns, calamari, and fish with dipping sauces', price: 'NPR 1,899', image: '/assets/bcd-seafood.jpg', category: 'Seafood' },
      { name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, house caesar dressing', price: 'NPR 799', image: '/assets/bcd-salad.jpg', category: 'Salads' },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with vanilla ice cream', price: 'NPR 599', image: '/assets/bcd-dessert.jpg', category: 'Desserts' },
      { name: 'Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms and herbs', price: 'NPR 1,199', image: '/assets/bcd-mushroom.jpg', category: 'Pasta & Rice' },
      { name: 'Beef Tenderloin', description: 'Pan-seared tenderloin with red wine reduction', price: 'NPR 2,199', image: '/assets/bcd-tenderloin.jpg', category: 'Steaks' },
      { name: 'Prawn Cocktail', description: 'Chilled tiger prawns with Marie Rose sauce', price: 'NPR 999', image: '/assets/bcd-prawn.jpg', category: 'Starters' },
      { name: 'French Onion Soup', description: 'Classic soup with gruyere crouton', price: 'NPR 699', image: '/assets/bcd-soup.jpg', category: 'Starters' },
    ],
    contact: {
      address: 'Durbar Marg, Kathmandu 44600, Nepal',
      phone: '+977-1-4441234',
      email: 'info@bcd.restro24.com',
      hours: 'Sun-Sat: 11:00 AM - 11:00 PM'
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(restaurantData.menuHighlights.map(item => 
    item.category || 'Main Course'
  ))];

  // Filter menu items based on search and category
  const filteredMenuItems = restaurantData.menuHighlights.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const itemCategory = item.category || 'Main Course';
    const matchesCategory = selectedCategory === 'all' || itemCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedItems = showAllMenu ? filteredMenuItems : filteredMenuItems.slice(0, 4);

  return (
    <div className="restaurant-page bcd-theme">
      <header className="restaurant-header">
        <nav className="restaurant-nav">
          <div className="nav-brand">
            <span className="nav-title">{restaurantData.name}</span>
          </div>
          <div className="nav-links">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/order" state={{ tenant: restaurantData }} className="order-btn">
              Order Online
            </Link>
            <Link to="/login" state={{ tenant: restaurantData }} className="staff-login">
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
            <h1>{restaurantData.name}</h1>
            <p className="hero-tagline">{restaurantData.tagline}</p>
            <p className="hero-description">{restaurantData.description}</p>
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

        <section className="specialties-section">
          <div className="container">
            <h2>Our Specialties</h2>
            <div className="specialties-grid">
              {restaurantData.specialties.map((specialty, index) => (
                <div key={index} className="specialty-item">
                  <div className="specialty-icon"></div>
                  <h3>{specialty}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="menu" className="menu-section">
          <div className="container">
            <h2>Our Full Menu</h2>
            
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
              Showing {displayedItems.length} of {filteredMenuItems.length} items
            </div>

            <div className="menu-grid">
              {displayedItems.map((item, index) => (
                <div key={index} className="menu-item-card">
                  <div className="menu-item-image" style={{
                    background: `hsl(${(index * 47) % 360}, 70%, 92%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{fontSize: '2.5rem', fontWeight: 800, color: `hsl(${(index * 47) % 360}, 60%, 45%)`, opacity: 0.6}}>
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <div className="menu-item-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="menu-item-footer">
                      <span className="price">{item.price}</span>
                      <button className="add-to-cart">Add to Cart</button>
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
              <button className="view-full-menu" onClick={() => {
                setShowAllMenu(!showAllMenu);
                if (showAllMenu) document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
              }}>
                {showAllMenu ? 'Show Less' : `View Full Menu (${filteredMenuItems.length} items)`}
              </button>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>About {restaurantData.name}</h2>
                <p>
                  Since our establishment, BCD Restaurant has been committed to delivering 
                  an exceptional dining experience that combines traditional culinary techniques 
                  with modern innovation. Our expert chefs source only the finest ingredients 
                  to create dishes that delight and inspire.
                </p>
                <p>
                  Whether you're celebrating a special occasion or enjoying a casual meal 
                  with friends, BCD Restaurant provides the perfect atmosphere for memorable 
                  dining experiences.
                </p>
              </div>
              <div className="about-image">
                <img src="/assets/bcd-interior.jpg" alt="BCD Restaurant Interior" />
              </div>
            </div>
          </div>
        </section>

        <section className="reviews-section">
          <div className="container">
            <h2>What Our Guests Say</h2>
            <div className="reviews-grid">
              <div className="review-card">
                <div className="review-rating">★★★★★</div>
                <p className="review-text">
                  "Absolutely outstanding! The Wagyu steak was cooked to perfection. 
                  The ambiance and service exceeded our expectations."
                </p>
                <div className="review-author">
                  <strong>Rajesh Kumar</strong>
                  <span>Regular Customer</span>
                </div>
              </div>
              <div className="review-card">
                <div className="review-rating">★★★★★</div>
                <p className="review-text">
                  "Best fine dining experience in Kathmandu! The lobster risotto is a must-try. 
                  Perfect for special occasions."
                </p>
                <div className="review-author">
                  <strong>Sarah Johnson</strong>
                  <span>Food Critic</span>
                </div>
              </div>
              <div className="review-card">
                <div className="review-rating">★★★★★</div>
                <p className="review-text">
                  "Impeccable service and exquisite cuisine. The wine selection is impressive. 
                  Highly recommend for business dinners."
                </p>
                <div className="review-author">
                  <strong>Amit Sharma</strong>
                  <span>Business Executive</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gallery-section">
          <div className="container">
            <h2>Gallery</h2>
            <div className="gallery-grid">
              <div className="gallery-item">
                <img src="/assets/bcd-dish1.jpg" alt="Signature Dish" />
                <div className="gallery-overlay">
                  <span>Signature Wagyu Steak</span>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/assets/bcd-dish2.jpg" alt="Interior" />
                <div className="gallery-overlay">
                  <span>Elegant Dining Area</span>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/assets/bcd-dish3.jpg" alt="Dessert" />
                <div className="gallery-overlay">
                  <span>Artisan Desserts</span>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/assets/bcd-dish4.jpg" alt="Bar" />
                <div className="gallery-overlay">
                  <span>Premium Bar</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Do you accept reservations?</h3>
                <p>Yes, we highly recommend making reservations, especially for dinner service and weekends. You can reserve a table using the button above or by calling us directly.</p>
              </div>
              <div className="faq-item">
                <h3>What are your dress code requirements?</h3>
                <p>We maintain a smart casual dress code. While we don't require formal attire, we ask guests to avoid sportswear and flip-flops.</p>
              </div>
              <div className="faq-item">
                <h3>Do you accommodate dietary restrictions?</h3>
                <p>Absolutely! Our chefs can accommodate vegetarian, vegan, gluten-free, and other dietary requirements. Please inform us when making your reservation.</p>
              </div>
              <div className="faq-item">
                <h3>Is parking available?</h3>
                <p>Yes, we offer complimentary valet parking for all our guests. Additional street parking is also available nearby.</p>
              </div>
              <div className="faq-item">
                <h3>Do you host private events?</h3>
                <p>Yes, we have private dining rooms available for special events, corporate gatherings, and celebrations. Please contact us for more details.</p>
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
                  <p>{restaurantData.contact.address}</p>
                </div>
                <div className="contact-item">
                  <h3>Phone</h3>
                  <p>{restaurantData.contact.phone}</p>
                </div>
                <div className="contact-item">
                  <h3>Email</h3>
                  <p>{restaurantData.contact.email}</p>
                </div>
                <div className="contact-item">
                  <h3>Hours</h3>
                  <p>{restaurantData.contact.hours}</p>
                </div>
                <div className="contact-item">
                  <h3>Follow Us</h3>
                  <div className="social-links">
                    <a href="https://facebook.com/bcdrestaurant" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      Facebook
                    </a>
                    <a href="https://instagram.com/bcdrestaurant" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      Instagram
                    </a>
                    <a href="https://twitter.com/bcdrestaurant" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
              <div className="contact-map">
                <iframe
                  title="BCD Restaurant Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2!2d85.3240!3d27.7172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQzJzAyLjAiTiA4NcKwMTknMjYuNCJF!5e0!3m2!1sen!2snp!4v1234567890"
                  width="100%"
                  height="300"
                  style={{border: 0, borderRadius: '8px'}}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-content">
              <h2>Stay Updated</h2>
              <p>Subscribe to our newsletter for exclusive offers, events, and culinary updates</p>
              <form className="newsletter-form" onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  alert('Please enter a valid email address.');
                  return;
                }
                alert('Thank you for subscribing! You will receive our latest updates.');
                e.target.reset();
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
              <p>&copy; 2026 {restaurantData.name}. All rights reserved.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="#menu">Menu</a></li>
                  <li><Link to="/order" state={{ tenant: restaurantData }}>Order Online</Link></li>
                  <li><button onClick={() => setIsReservationModalOpen(true)} className="footer-reserve-btn">Reserve Table</button></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Management</h4>
                <ul>
                  <li><Link to="/login" state={{ tenant: restaurantData }}>Manager Login</Link></li>
                  <li><a href="https://restro24.com" target="_blank" rel="noopener noreferrer">Restro24 Platform</a></li>
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
        restaurantName={restaurantData.name}
        tenantId="bcd"
      />
    </div>
  );
};

export default BCDRestaurantPage;