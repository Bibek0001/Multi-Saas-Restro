import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import '../styles/RestaurantPage.css';

const CDFRestaurantPage = () => {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAllMenu, setShowAllMenu] = useState(false);

  const restaurantData = {
    id: 'cdf',
    name: 'CDF Bistro',
    tagline: 'Fresh, Organic & Sustainable',
    description: 'Discover the perfect harmony of fresh, organic ingredients and sustainable practices at CDF Bistro, where every meal supports local farmers and your well-being.',
    logo: '/assets/cdf-logo.png',
    heroImage: '/assets/cdf-hero.jpg',
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#047857'
    },
    specialties: [
      'Farm-to-Table Cuisine',
      'Organic Vegetarian Options',
      'Sustainable Seafood',
      'Artisanal Coffee & Teas'
    ],
    menuHighlights: [
      { name: 'Organic Garden Salad', description: 'Fresh mixed greens with seasonal vegetables and herb vinaigrette', price: 'NPR 799', image: '/assets/cdf-salad.jpg', category: 'Salads' },
      { name: 'Sustainable Catch of the Day', description: 'Fresh local fish with quinoa pilaf and roasted vegetables', price: 'NPR 1,199', image: '/assets/cdf-fish.jpg', category: 'Seafood' },
      { name: 'Plant-Based Buddha Bowl', description: 'Quinoa, roasted vegetables, avocado, and tahini dressing', price: 'NPR 899', image: '/assets/cdf-bowl.jpg', category: 'Vegetarian' },
      { name: 'Classic Margherita Pizza', description: 'Wood-fired with fresh mozzarella, tomato sauce, and basil', price: 'NPR 999', image: '/assets/cdf-pizza.jpg', category: 'Pizza' },
      { name: 'Avocado Toast', description: 'Sourdough with smashed avocado, poached egg, and microgreens', price: 'NPR 699', image: '/assets/cdf-avocado.jpg', category: 'Breakfast' },
      { name: 'Lentil Soup', description: 'Hearty red lentil soup with cumin and fresh herbs', price: 'NPR 549', image: '/assets/cdf-soup.jpg', category: 'Soups' },
      { name: 'Grilled Veggie Wrap', description: 'Seasonal vegetables, hummus, and feta in a whole wheat wrap', price: 'NPR 749', image: '/assets/cdf-wrap.jpg', category: 'Wraps' },
      { name: 'Acai Bowl', description: 'Blended acai with granola, fresh fruits, and honey', price: 'NPR 849', image: '/assets/cdf-acai.jpg', category: 'Breakfast' },
      { name: 'Mushroom Risotto', description: 'Organic arborio rice with wild mushrooms and truffle oil', price: 'NPR 1,099', image: '/assets/cdf-risotto.jpg', category: 'Mains' },
      { name: 'Chicken Caesar Salad', description: 'Grilled organic chicken, romaine, parmesan, croutons', price: 'NPR 899', image: '/assets/cdf-caesar.jpg', category: 'Salads' },
      { name: 'Vegan Burger', description: 'Black bean patty with avocado, tomato, and chipotle mayo', price: 'NPR 849', image: '/assets/cdf-burger.jpg', category: 'Mains' },
      { name: 'Mango Lassi', description: 'Fresh mango blended with organic yogurt and cardamom', price: 'NPR 349', image: '/assets/cdf-lassi.jpg', category: 'Drinks' },
    ],
    contact: {
      address: 'Thamel, Kathmandu 44600, Nepal',
      phone: '+977-1-4445678',
      email: 'hello@cdf.restro24.com',
      hours: 'Sun-Sat: 8:00 AM - 10:00 PM'
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
    <div className="restaurant-page cdf-theme">
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
              <Link to="/order" state={{ tenant: restaurantData }} className="cta-primary">
                Order Now
              </Link>
            </div>
          </div>
        </section>

        <section className="specialties-section">
          <div className="container">
            <h2>Our Commitment</h2>
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
                    background: `hsl(${(index * 53 + 120) % 360}, 65%, 92%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{fontSize: '2.5rem', fontWeight: 800, color: `hsl(${(index * 53 + 120) % 360}, 55%, 40%)`, opacity: 0.6}}>
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
                  CDF Bistro was born from a passion for sustainable dining and supporting 
                  local communities. We partner directly with organic farms within a 50-mile 
                  radius to bring you the freshest, most flavorful ingredients while 
                  minimizing our environmental impact.
                </p>
                <p>
                  Our cozy bistro atmosphere provides the perfect setting for conscious 
                  dining, whether you're enjoying a quick lunch or a leisurely dinner 
                  with loved ones. Every dish is crafted with care for both your health 
                  and our planet.
                </p>
              </div>
              <div className="about-image">
                <img src="/assets/cdf-interior.jpg" alt="CDF Bistro Interior" />
              </div>
            </div>
          </div>
        </section>

        <section className="reviews-section">
          <div className="container">
            <h2>Customer Reviews</h2>
            <div className="reviews-grid">
              <div className="review-card">
                <div className="review-rating">★★★★★</div>
                <p className="review-text">
                  "Love the farm-to-table concept! Everything tastes so fresh and healthy. 
                  The Buddha bowl is my favorite!"
                </p>
                <div className="review-author">
                  <strong>Priya Thapa</strong>
                  <span>Health Enthusiast</span>
                </div>
              </div>
              <div className="review-card">
                <div className="review-rating">★★★★★</div>
                <p className="review-text">
                  "Finally, a restaurant that cares about sustainability! Great vegetarian options 
                  and the coffee is exceptional."
                </p>
                <div className="review-author">
                  <strong>Michael Chen</strong>
                  <span>Environmental Advocate</span>
                </div>
              </div>
              <div className="review-card">
                <div className="review-rating">★★★★★</div>
                <p className="review-text">
                  "Cozy atmosphere, friendly staff, and delicious organic food. 
                  Perfect spot for a healthy lunch break!"
                </p>
                <div className="review-author">
                  <strong>Sita Rai</strong>
                  <span>Local Resident</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gallery-section">
          <div className="container">
            <h2>Our Bistro</h2>
            <div className="gallery-grid">
              <div className="gallery-item">
                <img src="/assets/cdf-organic.jpg" alt="Organic Ingredients" />
                <div className="gallery-overlay">
                  <span>Fresh Organic Produce</span>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/assets/cdf-interior2.jpg" alt="Cozy Interior" />
                <div className="gallery-overlay">
                  <span>Cozy Atmosphere</span>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/assets/cdf-coffee.jpg" alt="Artisan Coffee" />
                <div className="gallery-overlay">
                  <span>Artisan Coffee</span>
                </div>
              </div>
              <div className="gallery-item">
                <img src="/assets/cdf-farm.jpg" alt="Local Farm" />
                <div className="gallery-overlay">
                  <span>Partner Farms</span>
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
                <h3>Are all your ingredients organic?</h3>
                <p>We source 95% of our ingredients from certified organic farms. Items that aren't organic are clearly marked on our menu.</p>
              </div>
              <div className="faq-item">
                <h3>Do you have vegan options?</h3>
                <p>Yes! We have a dedicated vegan menu with plenty of delicious plant-based options. All dishes can be customized to meet dietary preferences.</p>
              </div>
              <div className="faq-item">
                <h3>Can I order for takeaway?</h3>
                <p>Absolutely! You can order online through our website or call us directly. We use eco-friendly, compostable packaging for all takeaway orders.</p>
              </div>
              <div className="faq-item">
                <h3>Do you offer catering services?</h3>
                <p>Yes, we provide catering for events, meetings, and special occasions. Contact us for custom menu options and pricing.</p>
              </div>
              <div className="faq-item">
                <h3>Where do you source your ingredients?</h3>
                <p>We partner with local organic farms within 50 miles of Kathmandu. We're proud to support sustainable agriculture and local communities.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container">
            <h2>Visit Our Bistro</h2>
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
                  <h3>Connect With Us</h3>
                  <div className="social-links">
                    <a href="https://facebook.com/cdfbistro" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      Facebook
                    </a>
                    <a href="https://instagram.com/cdfbistro" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      Instagram
                    </a>
                    <a href="https://twitter.com/cdfbistro" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
              <div className="contact-map">
                <iframe
                  title="CDF Bistro Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.0!2d85.3100!3d27.7150!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzU0LjAiTiA4NcKwMTgnMzYuMCJF!5e0!3m2!1sen!2snp!4v1234567890"
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
              <h2>Join Our Community</h2>
              <p>Get updates on seasonal menus, sustainability initiatives, and exclusive offers</p>
              <form className="newsletter-form" onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  alert('Please enter a valid email address.');
                  return;
                }
                alert('Welcome to the CDF Bistro community! Check your email for a special welcome offer.');
                e.target.reset();
              }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-button">Join Now</button>
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
        tenantId="cdf"
      />
    </div>
  );
};

export default CDFRestaurantPage;