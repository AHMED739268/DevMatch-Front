import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.jsx';
import Navbar from '../components/Navbar';
import {
  MapPin,
  Briefcase,
  CalendarDays,
  FileText,
  User,
  Heart,
  Quote
} from 'lucide-react';

const FreelancerProfile = () => {
  const currentUser = useAuthStore((state) => state.authUser);
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(userResponse.data);

        if (currentUser) {
          const followStatus = await axios.get(
            `http://localhost:5000/api/follow/status/${id}`,
            {
              headers: {
                Authorization: `Bearer ${getAuthToken()}`
              }
            }
          );
          setIsFollowing(followStatus.data.isFollowing);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      };

      if (isFollowing) {
        await axios.post('http://localhost:5000/api/follow/unfollow', { followingId: id }, config);
      } else {
        await axios.post('http://localhost:5000/api/follow/follow', { followingId: id }, config);
      }

      setIsFollowing((prev) => !prev);
    } catch (error) {
      console.error('Error toggling follow:', error.response?.data?.message || error.message);
    }
  };

  if (!id) {
    return <p className="text-center my-5 text-danger">No user ID provided in the URL.</p>;
  }

  if (loading) {
    return <p className="text-center my-5">Loading user profile...</p>;
  }

  if (!user) {
    return <p className="text-center my-5 text-danger">User not found</p>;
  }

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div
          className="rounded-4 text-white mb-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #3A86FF, #4361EE)', padding: '3rem 1rem' }}
        >
          <div className="d-flex flex-column align-items-center position-relative text-center">
            <img
              src={user.image || '/profile.jpg'}
              alt="Profile"
              className="rounded-circle border border-3 border-white shadow"
              style={{ width: '140px', height: '140px', objectFit: 'cover' }}
            />
            <h3 className="mt-3 mb-1 fw-bold">{user.name}</h3>

            {user.technology?.length > 0 && (
              <div className="text-light mb-1 d-flex flex-wrap justify-content-center align-items-center">
                <User size={16} className="me-1" />
                {user.technology.map((tech, index) => (
                  <span key={index} className="mx-1 small text-white-50">
                    {tech}
                    {index < user.technology.length - 1 && <span className="mx-1">|</span>}
                  </span>
                ))}
              </div>
            )}

            <p className="text-light">
              <MapPin size={16} className="me-1" /> {user.location}
            </p>

            {currentUser && String(currentUser._id || currentUser.id) !== String(id) && (
              <button
                onClick={handleFollowToggle}
                className={`btn position-absolute top-0 end-0 m-3 d-flex align-items-center shadow-sm ${
                  isFollowing ? 'btn-danger text-white' : 'btn-light'
                }`}
                style={{ borderRadius: '20px', transition: '0.3s ease' }}
                aria-label={isFollowing ? 'Unfollow Freelancer' : 'Follow Freelancer'}
              >
                <Heart
                  size={16}
                  className={`me-1 ${isFollowing ? 'text-white fill-current' : 'text-danger'}`}
                />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto" style={{ maxWidth: '960px', marginTop: '-30px' }}>
          <div className="card shadow border-0 p-4 rounded-4">
            <h5 className="fw-bold mb-3 text-primary">About Me</h5>
            <div
              className="p-3 border-start border-3 rounded bg-light-subtle d-flex align-items-start gap-2"
              style={{ fontStyle: 'italic' }}
            >
              <Quote size={18} className="text-secondary mt-1" />
              <span>{user.aboutMe}</span>
            </div>

            <div className="row mt-4">
              <div className="col-md-6 mb-2">
                <Briefcase className="me-2 text-secondary" size={18} />
                <strong>Experience:</strong> {user.experience} years
              </div>
              <div className="col-md-6 mb-2">
                <CalendarDays className="me-2 text-secondary" size={18} />
                <strong>Registered:</strong>{' '}
                {new Date(user.registration_date).toLocaleDateString()}
              </div>
            </div>

            {user.skills && (
              <div className="mt-4">
                <h6 className="fw-bold text-primary">Skills</h6>
                <div className="d-flex flex-wrap gap-2">
                  {user.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="badge rounded-pill bg-primary-subtle text-primary border border-primary"
                      title={skill.trim()}
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.technology && user.technology.length > 0 && (
              <div className="mt-4">
                <h6 className="fw-bold text-primary">Technologies</h6>
                <div className="d-flex flex-wrap gap-2">
                  {user.technology.map((tech, index) => (
                    <span
                      key={index}
                      className="badge rounded-pill bg-light text-dark border"
                      title={tech}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CV + GitHub Buttons */}
            {(user.cv_url || user.github) && (
              <div className="mt-4 d-flex gap-3 flex-wrap">
                {user.cv_url && (
                  <a
                    href={user.cv_url}
                    className="btn btn-outline-primary d-inline-flex align-items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={18} className="me-2" />
                    View CV
                  </a>
                )}
                {user.github && (
                  <a
                    href={user.github}
                    className="btn btn-dark d-inline-flex align-items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#24292e', borderColor: '#24292e' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 
               7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49
               -2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94
               -.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 
               1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07
               -.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64
               -3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02
               .08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 
               2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 
               2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 
               1.27.82 2.15 0 3.07-1.87 3.75-3.65 
               3.95.29.25.54.73.54 1.48 0 1.07-.01 
               1.93-.01 2.19 0 .21.15.46.55.38A8.013 
               8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FreelancerProfile;
