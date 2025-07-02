import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faBell } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../pages/NotificationContext';
import { useAuth } from '../pages/AuthContext';

export default function Navbar({ rightElement, lang = 'en' }) {
  const { user, logout, isAuthenticated, isRecruiter, isProgrammer } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function blockBack() {
      window.history.pushState(null, '', window.location.href);
    });
  };

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications) markAllAsRead();
  };

  const t = {
    jobs: lang === 'ar' ? 'الوظائف' : 'Jobs',
    community: lang === 'ar' ? 'المجتمع' : 'Community',
    freelancers: lang === 'ar' ? 'المستقلون' : 'Freelancers',
    dashboard: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    welcome: lang === 'ar' ? 'مرحباً' : 'Welcome',
    logout: lang === 'ar' ? 'تسجيل الخروج' : 'Logout',
    login: lang === 'ar' ? 'تسجيل الدخول' : 'Login',
    signup: lang === 'ar' ? 'إنشاء حساب' : 'Sign Up',
    notifications: lang === 'ar' ? 'الإشعارات' : 'Notifications',
    noNotifications: lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications',
    following: lang === 'ar' ? 'المتابَعون' : 'Following',
    applications: lang === 'ar' ? 'طلباتي' : 'My Applications',
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <img src="https://raw.githubusercontent.com/abanoub1234/kkkk/refs/heads/main/new.png" alt="DevMatch Logo" style={{ height: '30px' }} />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          {/* Left-side navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated && (
              <>
                <li className="nav-item"><Link to="/jobs" className="nav-link">{t.jobs}</Link></li>
                <li className="nav-item"><a className="nav-link" href="/chat">Community</a></li>
                <li className="nav-item position-relative">
                  <a 
                    className="nav-link d-flex align-items-center gap-2" 
                    href="/privatechats"
                    style={{
                      padding: '8px 12px',
                      fontWeight: '500',
                      position: 'relative'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={faComments} 
                      style={{ 
                        color: '#1a73e8',
                        fontSize: '1.1rem',
                        transition: 'all 0.2s ease'
                      }} 
                    />
                    <span 
                      style={{
                        color: '#1a73e8',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Chatty
                    </span>
                    {unreadCount > 0 && (
                      <span className="chatty-badge">{unreadCount}</span>
                    )}
                  </a>
                </li>
                <li className="nav-item"><a href="/Freelancers" className="nav-link">{t.freelancers}</a></li>
                <li className="nav-item"><Link to="/following" className="nav-link">{t.following}</Link></li>
              </>
            )}
            {isProgrammer && (
              <li className="nav-item"><Link to="/my-applications" className="nav-link">{t.applications}</Link></li>
            )}
          </ul>

          {/* Right-side elements */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated && isProgrammer && (
              <div className="position-relative">
                <button className="btn btn-link position-relative" onClick={handleBellClick} style={{ fontSize: '1.5rem' }}>
                  <FontAwesomeIcon icon={faBell} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`card shadow border-0 position-absolute mt-2 ${lang === 'ar' ? 'start-0' : 'end-0'}`} style={{ minWidth: 300, zIndex: 1000 }}>
                    <div className="card-body p-2" style={{ maxHeight: 350, overflowY: 'auto' }}>
                      <h6 className="card-title mb-2">{t.notifications}</h6>
                      {notifications.length === 0 ? (
                        <div className="text-center text-muted">{t.noNotifications}</div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="alert alert-info py-2 px-3 mb-2">
                            <div style={{ fontSize: '0.95rem' }}>
                              {notif.message || notif.text || t.notifications}
                            </div>
                            <div className="text-muted small mt-1">
                              {notif.time ? new Date(notif.time).toLocaleString(lang === 'ar' ? 'ar-EG' : undefined) : ''}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {rightElement && <div>{rightElement}</div>}

            {isAuthenticated && isRecruiter && (
              <Link to="/recruiter-dashboard" className="btn btn-outline-primary">
                <i className="bi bi-speedometer2 me-1"></i> {t.dashboard}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">{t.welcome}, <strong>{user.name}</strong></span>
                <button onClick={handleLogout} className="btn btn-outline-danger">
                  <i className="bi bi-box-arrow-right me-1"></i> {t.logout}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login"><button className="btn btn-outline-primary">{t.login}</button></Link>
                <Link to="/register"><button className="btn btn-primary">{t.signup}</button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
