import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import Notification from '../../components/Notification';
import ApiService from '../../services/api';
import './ProfileSetup.css';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    phoneNumber: '',
    customCountry: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCustomCountry, setShowCustomCountry] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserData(user);
      
      // Check if admin user and redirect directly
      if (user.role === 'ADMIN' || user.username === 'jyoti_930244' || user.username === 'admin' || user.email?.includes('admin')) {
        if (user.firstName && user.lastName) {
          navigate('/admin');
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        userId: user.id
      }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'country') {
      setShowCustomCountry(value === 'Other');
      if (value !== 'Other') {
        setFormData({
          ...formData,
          country: value,
          customCountry: ''
        });
      } else {
        setFormData({
          ...formData,
          country: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const profileData = {
        userId: userData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country === 'Other' ? formData.customCountry : formData.country,
        city: formData.city,
        phoneNumber: formData.phoneNumber
      };
      
      const response = await ApiService.updateProfile(userData.id, profileData, profileImage);
      
      // Update stored user data
      const updatedUserData = {
        ...userData,
        firstName: response.firstName,
        lastName: response.lastName,
        country: response.country,
        city: response.city,
        phoneNumber: response.phoneNumber,
        profilePhoto: response.profilePhoto
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
      // Check if admin user
      if (userData.role === 'ADMIN' || userData.username === 'jyoti_930244' || userData.username === 'admin' || userData.email?.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/role-selection');
      }
      
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-setup-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Floating Background Shapes */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.6), transparent)',
          top: '-100px',
          left: '-100px',
          filter: 'blur(80px)',
          opacity: 0.4,
          animation: 'float1 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.5), transparent)',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(80px)',
          opacity: 0.4,
          animation: 'float2 8s ease-in-out infinite'
        }} />
      </div>
      <div className="profile-content" style={{ flex: 1, padding: '2rem 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '1rem', display: 'block', textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>Complete Your Profile</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', margin: '0', display: 'block' }}>Tell us more about yourself</p>

          </div>

          <div className="profile-form-section">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="photo-upload-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div className="photo-container" style={{ position: 'relative', display: 'inline-block' }}>
                  <div className="photo-preview" style={{ 
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '50%', 
                    border: '5px solid rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                    position: 'relative',
                    overflow: 'hidden',
                    margin: '0 auto',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" style={{ color: '#94a3b8' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="profilePhoto" 
                    className="camera-button"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      width: '45px',
                      height: '45px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '3px solid white',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M12 15.2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                    </svg>
                  </label>
                </div>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: '0.95rem',
                  marginTop: '1rem',
                  margin: '1rem 0 0 0',
                  fontWeight: '500'
                }}>
                  Upload a profile picture
                </p>
              </div>

            <div className="form-row">
              <div className="form-group">
                <label>First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mobile number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+91 50 827 8229"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Singapore">Singapore</option>
                  <option value="UAE">UAE</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Other">Other</option>
                </select>
                {showCustomCountry && (
                  <input
                    type="text"
                    name="customCountry"
                    value={formData.customCountry}
                    onChange={handleInputChange}
                    placeholder="Enter your country name"
                    required
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio (Optional)</label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                rows="3"
              ></textarea>
            </div>



            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button type="submit" className="continue-btn" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Continue'}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default ProfileSetup;