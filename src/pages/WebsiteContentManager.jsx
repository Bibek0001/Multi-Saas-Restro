import React, { useState } from 'react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { useTenant } from '../context/TenantContext';
import '../styles/WebsiteContentManager.css';

const WebsiteContentManager = () => {
  const { content, loading, updateProfile, updateBusinessHours, addMenuItem, updateMenuItem, deleteMenuItem } = useWebsiteContent();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  if (loading) {
    return <div className="loading">Loading content...</div>;
  }

  if (!content) {
    return <div className="error">Failed to load content</div>;
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = {
      name: formData.get('name'),
      tagline: formData.get('tagline'),
      description: formData.get('description'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address')
    };

    const result = await updateProfile(profileData);
    setSaveStatus(result.success ? 'Profile updated successfully!' : result.error);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleHoursUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const hoursData = {};
    
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      hoursData[day] = {
        open: formData.get(`${day}-open`),
        close: formData.get(`${day}-close`),
        closed: formData.get(`${day}-closed`) === 'on'
      };
    });

    const result = await updateBusinessHours(hoursData);
    setSaveStatus(result.success ? 'Business hours updated successfully!' : result.error);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const menuItem = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      category: formData.get('category'),
      image: formData.get('image') || '/assets/default-dish.jpg',
      available: true
    };

    const result = await addMenuItem(menuItem);
    if (result.success) {
      setSaveStatus('Menu item added successfully!');
      setShowAddItem(false);
      e.target.reset();
    } else {
      setSaveStatus(result.error);
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleUpdateMenuItem = async (itemId, updates) => {
    const result = await updateMenuItem(itemId, updates);
    setSaveStatus(result.success ? 'Menu item updated!' : result.error);
    setEditingItem(null);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const result = await deleteMenuItem(itemId);
      setSaveStatus(result.success ? 'Menu item deleted!' : result.error);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="content-manager">
      <div className="content-manager-header">
        <h1>Website Content Manager</h1>
        <p>Manage your restaurant's public website content</p>
      </div>

      {saveStatus && (
        <div className={`save-status ${saveStatus.includes('success') ? 'success' : 'error'}`}>
          {saveStatus}
        </div>
      )}

      <div className="content-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Restaurant Profile
        </button>
        <button 
          className={activeTab === 'hours' ? 'active' : ''}
          onClick={() => setActiveTab('hours')}
        >
          Business Hours
        </button>
        <button 
          className={activeTab === 'menu' ? 'active' : ''}
          onClick={() => setActiveTab('menu')}
        >
          Menu Items
        </button>
        <button 
          className={activeTab === 'preview' ? 'active' : ''}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="content-panel">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <h2>Restaurant Profile</h2>
            
            <div className="form-group">
              <label>Restaurant Name *</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={content.profile.name}
                required 
              />
            </div>

            <div className="form-group">
              <label>Tagline</label>
              <input 
                type="text" 
                name="tagline" 
                defaultValue={content.profile.tagline}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                rows="4"
                defaultValue={content.profile.description}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  defaultValue={content.profile.phone}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={content.profile.email}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                name="address" 
                defaultValue={content.profile.address}
              />
            </div>

            <button type="submit" className="btn-primary">Save Profile</button>
          </form>
        )}

        {activeTab === 'hours' && (
          <form onSubmit={handleHoursUpdate} className="hours-form">
            <h2>Business Hours</h2>
            
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <div key={day} className="hours-row">
                <div className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                <div className="hours-inputs">
                  <input 
                    type="time" 
                    name={`${day}-open`}
                    defaultValue={content.businessHours[day].open}
                    disabled={content.businessHours[day].closed}
                  />
                  <span>to</span>
                  <input 
                    type="time" 
                    name={`${day}-close`}
                    defaultValue={content.businessHours[day].close}
                    disabled={content.businessHours[day].closed}
                  />
                  <label className="closed-checkbox">
                    <input 
                      type="checkbox" 
                      name={`${day}-closed`}
                      defaultChecked={content.businessHours[day].closed}
                    />
                    Closed
                  </label>
                </div>
              </div>
            ))}

            <button type="submit" className="btn-primary">Save Hours</button>
          </form>
        )}

        {activeTab === 'menu' && (
          <div className="menu-manager">
            <div className="menu-header">
              <h2>Menu Items</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowAddItem(!showAddItem)}
              >
                {showAddItem ? 'Cancel' : 'Add New Item'}
              </button>
            </div>

            {showAddItem && (
              <form onSubmit={handleAddMenuItem} className="add-item-form">
                <h3>Add New Menu Item</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input type="text" name="category" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows="2" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (NPR) *</label>
                    <input type="number" name="price" step="0.01" min="0" required />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input type="text" name="image" placeholder="/assets/dish.jpg" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Add Item</button>
              </form>
            )}

            <div className="menu-items-list">
              {content.menuItems.map(item => (
                <div key={item.id} className="menu-item-card">
                  {editingItem === item.id ? (
                    <div className="edit-item-form">
                      <input 
                        type="text" 
                        defaultValue={item.name}
                        onBlur={(e) => handleUpdateMenuItem(item.id, { name: e.target.value })}
                      />
                      <textarea 
                        defaultValue={item.description}
                        onBlur={(e) => handleUpdateMenuItem(item.id, { description: e.target.value })}
                      />
                      <input 
                        type="number" 
                        defaultValue={item.price}
                        onBlur={(e) => handleUpdateMenuItem(item.id, { price: parseFloat(e.target.value) })}
                      />
                      <button onClick={() => setEditingItem(null)}>Done</button>
                    </div>
                  ) : (
                    <>
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h3>{item.name}</h3>
                        <p className="item-category">{item.category}</p>
                        <p className="item-description">{item.description}</p>
                        <p className="item-price">NPR {item.price}</p>
                        <div className="item-status">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={item.available}
                              onChange={(e) => handleUpdateMenuItem(item.id, { available: e.target.checked })}
                            />
                            Available
                          </label>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => setEditingItem(item.id)} className="btn-edit">Edit</button>
                        <button onClick={() => handleDeleteMenuItem(item.id)} className="btn-delete">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-panel">
            <h2>Website Preview</h2>
            <p className="preview-note">This is how your website will appear to visitors</p>
            <div className="preview-frame">
              <div className="preview-header">
                <h1>{content.profile.name}</h1>
                <p>{content.profile.tagline}</p>
              </div>
              <div className="preview-content">
                <section>
                  <h3>About</h3>
                  <p>{content.profile.description}</p>
                </section>
                <section>
                  <h3>Contact</h3>
                  <p>📞 {content.profile.phone}</p>
                  <p>📧 {content.profile.email}</p>
                  <p>📍 {content.profile.address}</p>
                </section>
                <section>
                  <h3>Menu Highlights</h3>
                  <div className="preview-menu">
                    {content.menuItems.slice(0, 3).map(item => (
                      <div key={item.id} className="preview-menu-item">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <span>NPR {item.price}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteContentManager;
