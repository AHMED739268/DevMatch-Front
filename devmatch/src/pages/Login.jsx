import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import GoogleSignupButton from '../components/GoogleSignupButton';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    if (verified) {
      switch (verified) {
        case 'success':
          setVerificationMsg('Your email has been verified! You can now log in.');
          break;
        case 'already':
          setVerificationMsg('Your email is already verified. Please log in.');
          break;
        case 'invalidtoken':
          setVerificationMsg('Invalid or expired verification link.');
          break;
        case 'notfound':
          setVerificationMsg('User not found for verification.');
          break;
        default:
          setVerificationMsg('');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (apiError) {
      setApiError('');
    }
    
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        // No validation needed for other fields
        break;
    }
    
    setErrors({ ...errors, [name]: error });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);

    const newTouched = {};
    Object.keys(form).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(newTouched);

    let isValid = true;
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      validateField(field, form[field]);
      if (!form[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });
    setErrors(newErrors);
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: form.email,
        password: form.password,
      });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      await login(user, token);
      if (user.role === 'recruiter') {
        if (!user.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      } else if (user.role === 'programmer') {
        if (!user.isProfileComplete) {
          navigate('/CompleteFreelancerProfile');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setApiError(
        (err.response?.data?.errors && err.response.data.errors[0]) ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Login failed. Please check your connection and try again.')
      );
      setIsLoading(false);
    }
  };

  const getFieldClass = (fieldName) => {
    if (!touched[fieldName]) return 'form-control';
    if (errors[fieldName]) return 'form-control is-invalid';
    if (form[fieldName]) return 'form-control is-valid';
    return 'form-control';
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="card-header text-center py-4" 
               style={{ backgroundColor: '#007bff', border: 'none' }}>
            <h2 className="text-white fw-bold mb-1">
              <i className="bi bi-code-square me-2"></i>
              Welcome Back
            </h2>
            <p className="text-white opacity-75 mb-0">Sign in to DevMatch</p>
          </div>
          
          <div className="card-body p-4">
            {verificationMsg && (
              <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>{verificationMsg}</div>
              </div>
            )}
            {apiError && (
              <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{apiError}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#007bff' }}>
                  <i className="bi bi-envelope me-1"></i> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={getFieldClass('email')}
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {touched.email && errors.email && (
                  <div className="text-danger small mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#007bff' }}>
                  <i className="bi bi-lock me-1"></i> Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={getFieldClass('password')}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {touched.password && errors.password && (
                  <div className="text-danger small mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.password}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn w-100 py-3 fw-semibold mb-3 text-white"
                disabled={isLoading}
                style={{ 
                  borderRadius: '10px',
                  backgroundColor: '#007bff',
                  border: 'none',
                  fontSize: '16px'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>
            <div className="mb-3 mt-3">
              <GoogleSignupButton label="Sign in with Google" />
            </div>

              <div className="text-center">
                <p className="text-muted mb-0">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-decoration-none fw-semibold"
                    style={{ color: '#007bff' }}
                  >
                    Create one here
                  </Link>
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}