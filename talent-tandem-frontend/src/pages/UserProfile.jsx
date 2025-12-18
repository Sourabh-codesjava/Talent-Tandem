import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBook, FaStar, FaUserGraduate, FaChalkboardTeacher, FaClock, FaCalendar } from 'react-icons/fa';
import ApiService from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const [userProfile, teach, learn] = await Promise.all([
        ApiService.getUserById(userId),
        ApiService.getTeachSkillsByUser(userId),
        ApiService.getLearnSkillsByUser(userId)
      ]);
      setProfile(userProfile);
      setTeachSkills(teach);
      setLearnSkills(learn);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-error">Profile not found</div>;
  }

  return (
    <div className="user-profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </div>
          <div className="profile-header-info">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className="profile-username">@{profile.username}</p>
            <div className="profile-badges">
              {profile.hasTeachProfile && (
                <span className="role-badge mentor-badge">
                  <FaChalkboardTeacher /> Mentor
                </span>
              )}
              {profile.hasLearnerProfile && (
                <span className="role-badge learner-badge">
                  <FaUserGraduate /> Learner
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="profile-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="info-grid">
            <div className="info-card">
              <FaEnvelope className="info-icon" />
              <div>
                <p className="info-label">Email</p>
                <p className="info-value">{profile.email}</p>
              </div>
            </div>
            {profile.phoneNumber && (
              <div className="info-card">
                <FaPhone className="info-icon" />
                <div>
                  <p className="info-label">Phone</p>
                  <p className="info-value">{profile.phoneNumber}</p>
                </div>
              </div>
            )}
            {profile.location && (
              <div className="info-card">
                <FaMapMarkerAlt className="info-icon" />
                <div>
                  <p className="info-label">Location</p>
                  <p className="info-value">{profile.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teaching Skills Section */}
        {teachSkills.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">
              <FaGraduationCap /> Teaching Skills ({teachSkills.length})
            </h2>
            <div className="skills-grid">
              {teachSkills.map(skill => (
                <div key={skill.id} className="skill-card teach-skill">
                  <div className="skill-header">
                    <h3>{skill.skillName}</h3>
                    <span className={`badge badge-${skill.proficiencyLevel?.toLowerCase()}`}>
                      {skill.proficiencyLevel}
                    </span>
                  </div>
                  {skill.availability && (
                    <div className="skill-details">
                      <div className="detail-item">
                        <FaCalendar />
                        <span>{skill.availability.dayOfWeek}</span>
                      </div>
                      <div className="detail-item">
                        <FaClock />
                        <span>{skill.availability.startTime} - {skill.availability.endTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Skills Section */}
        {learnSkills.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">
              <FaBook /> Learning Skills ({learnSkills.length})
            </h2>
            <div className="skills-grid">
              {learnSkills.map(skill => (
                <div key={skill.id} className="skill-card learn-skill">
                  <div className="skill-header">
                    <h3>{skill.skillName}</h3>
                    <span className={`badge badge-${skill.priority?.toLowerCase()}`}>
                      {skill.priority}
                    </span>
                  </div>
                  {skill.availability && (
                    <div className="skill-details">
                      <div className="detail-item">
                        <FaCalendar />
                        <span>{skill.availability.dayOfWeek}</span>
                      </div>
                      <div className="detail-item">
                        <FaClock />
                        <span>{skill.availability.startTime} - {skill.availability.endTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {teachSkills.length === 0 && learnSkills.length === 0 && (
          <div className="empty-state">
            <p>No skills added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
