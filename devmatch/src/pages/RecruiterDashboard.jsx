// src/pages/RecruiterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './RecruiterDashboard.css';
import '../styles/RecruiterProfile.css';
import '../styles/RecruiterJobs.css';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';

export default function RecruiterDashboard() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    company_name: '',
    company_description: '',
    company_website: '',
    company_size: '',
    linkedin: '',
    image: '',
    location: '',
    founded_year: ''
  });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    specialization: '',
    governorate: '',
    status: 'open',
    work_mode: 'onsite',
    job_type: 'full-time'
  });
  const [jobErrors, setJobErrors] = useState({});
  const [isPaid, setIsPaid] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const paginatedJobs = jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  const [deleteJobId, setDeleteJobId] = useState(null); // For delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use localStorage to persist isPaid after payment
  useEffect(() => {
    // On mount, check if localStorage says payment was made
    const paidFlag = localStorage.getItem('recruiterPaid');
    if (paidFlag === '1') {
      setIsPaid(true);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch company profile data (also contains isPaid)
        const userRes = await axiosInstance.get('/profile/recruiter');
        const userData = userRes.data.user;
        setIsPaid(!!userData.isPaid);
        if (userData.isPaid) {
          localStorage.removeItem('recruiterPaid');
        }
        // If image is a relative path, convert to absolute URL for <img src>
        let imageUrl = userData.image || '';
        if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
          // Remove leading 'public' if present, and prepend server URL
          imageUrl = imageUrl.replace(/^public[\\/]/, '');
          imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/'}${imageUrl}`;
        }
        setForm({
          company_name: userData.company_name || '',
          company_description: userData.company_description || '',
          company_website: userData.company_website || '',
          company_size: userData.company_size || '',
          linkedin: userData.linkedin || '',
          image: imageUrl,
          location: userData.location || '',
          founded_year: userData.founded_year || ''
        });

        // Fetch recruiter's jobs
        const jobsRes = await axiosInstance.get('/jobs');
        // Filter jobs by recruiter_id
        const recruiterJobs = jobsRes.data.filter(job => job.recruiter_id === user.id || job.recruiter_id === user._id);
        setJobs(recruiterJobs);

        // Fetch all freelancers
        const freelancersRes = await axiosInstance.get('/users');
        setFreelancers(freelancersRes.data.filter(u => u.role === 'programmer'));

        // Fetch applications for recruiter's jobs if on applications tab
        if (activeTab === 'applications') {
          // Use the correct endpoint for all applications for this recruiter
          const applicationsRes = await axiosInstance.get('/applications/recruiter');
          setApplications(applicationsRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, activeTab]);

  // Refetch payment status and open job modal after payment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('fromPayment') === '1') {
      // Set isPaid locally and persist in localStorage
      setIsPaid(true);
      localStorage.setItem('recruiterPaid', '1');
      if (params.get('tab') === 'jobs') {
        setActiveTab('jobs');
        setShowJobModal(true);
      }
    }
  }, [location.search]);

  // Enable the Post New Job button immediately after payment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('fromPayment') === '1') {
      // Remove the query param after enabling the button and opening the modal
      const newParams = new URLSearchParams(location.search);
      newParams.delete('fromPayment');
      window.history.replaceState({}, document.title, location.pathname + (newParams.toString() ? '?' + newParams.toString() : ''));
    }
  }, [isPaid, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
    if (jobErrors[name]) {
      setJobErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const yearRegex = /^\d{4}$/;

    if (!form.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!form.company_description.trim()) newErrors.company_description = 'Description is required';
    if (!form.company_website.trim()) {
      newErrors.company_website = 'Website is required';
    } else if (!urlRegex.test(form.company_website)) {
      newErrors.company_website = 'Please enter a valid URL';
    }
    if (!form.company_size) newErrors.company_size = 'Company size is required';
    if (form.linkedin && !urlRegex.test(form.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.founded_year) {
      newErrors.founded_year = 'Founded year is required';
    } else if (!yearRegex.test(form.founded_year)) {
      newErrors.founded_year = 'Please enter a valid year (YYYY)';
    } else if (parseInt(form.founded_year) > new Date().getFullYear()) {
      newErrors.founded_year = 'Year cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateJobForm = () => {
    const newErrors = {};
    
    if (!jobForm.title.trim()) newErrors.title = 'Job title is required';
    if (!jobForm.description.trim()) newErrors.description = 'Description is required';
    if (!jobForm.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!jobForm.governorate.trim()) newErrors.governorate = 'Location is required';
    
    setJobErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await axiosInstance.put(
        '/profile/recruiter',
        form
      );
      // Refetch the latest profile data after update
      const userRes = await axiosInstance.get('/profile/recruiter');
      const userData = userRes.data.user;
      let imageUrl = userData.image || '';
      if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace(/^public[\\/]/, '');
        imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/'}${imageUrl}`;
      }
      setForm({
        company_name: userData.company_name || '',
        company_description: userData.company_description || '',
        company_website: userData.company_website || '',
        company_size: userData.company_size || '',
        linkedin: userData.linkedin || '',
        image: imageUrl,
        location: userData.location || '',
        founded_year: userData.founded_year || ''
      });
      login({ ...user, ...userData, image: imageUrl });
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!validateJobForm()) {
      return;
    }

    // Restrict recruiters to 5 jobs unless payment is made or recruiterPaid=1 in localStorage
    if (jobs.length >= 5 && !isPaid && localStorage.getItem('recruiterPaid') !== '1') {
      // alert removed
      navigate('/payment', { state: { fromDashboard: true } });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/jobs', jobForm);
      
      setJobs(prev => [...prev, response.data.job]);
      setShowJobModal(false);
      setJobForm({
        title: '',
        description: '',
        specialization: '',
        governorate: '',
        status: 'open',
        work_mode: 'onsite',
        job_type: 'full-time'
      });
      // alert removed
    } catch (err) {
      console.error('Error posting job:', err);
      setError('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setForm(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      if (status === 'accepted') {
        await axiosInstance.put(`/applications/accept/${applicationId}`);
      } else if (status === 'rejected') {
        // If you have a reject endpoint, use it. Otherwise, fallback to a PATCH/PUT if supported.
        await axiosInstance.put(`/applications/reject/${applicationId}`);
      }
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application status');
    }
  };

  const handleViewJobApplications = (jobId) => {
    navigate(`/recruiter-dashboard/jobs/${jobId}/applications`);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(job => job._id !== jobId && job.id !== jobId));
      setShowDeleteModal(false);
      setDeleteJobId(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job');
      setShowDeleteModal(false);
      setDeleteJobId(null);
    }
  };

  if (loading && activeTab === 'profile' && !editing) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="bg-primary text-white py-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h4 mb-0">
                <i className="bi bi-briefcase me-2"></i>
                Recruiter Dashboard
              </h1>
            
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-4">
          <div className="row">
            {/* Sidebar */}
            <div className="col-md-3 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="text-center mb-4">
                    {form.image ? (
                      <img 
                        src={form.image} 
                        alt="Company logo" 
                        className="rounded-circle mb-3" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '100px', height: '100px' }}>
                        <i className="bi bi-building text-muted" style={{ fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <h5 className="mb-1">{form.company_name || 'Your Company'}</h5>
                    <small className="text-muted">{form.location || 'Location'}</small>
                  </div>

                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <button 
                        className={`nav-link d-flex align-items-center ${activeTab === 'profile' ? 'active text-primary' : 'text-dark'}`}
                        onClick={() => setActiveTab('profile')}
                      >
                        <i className="bi bi-person me-2"></i>
                        Company Profile
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link d-flex align-items-center ${activeTab === 'jobs' ? 'active text-primary' : 'text-dark'}`}
                        onClick={() => setActiveTab('jobs')}
                      >
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Posted Jobs
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Panel */}
            <div className="col-md-9">
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="recruiter-profile-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 recruiter-profile-title">
                      <i className="bi bi-building me-2 text-primary"></i>
                      Company Profile
                    </h5>
                    {!editing ? (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditing(true)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit Profile
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditing(false)}
                      >
                        <i className="bi bi-x me-1"></i>
                        Cancel
                      </button>
                    )}
                  </div>

                  <div>
                    {editing ? (
                      <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Company Name</label>
                            <input
                              type="text"
                              className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                              name="company_name"
                              value={form.company_name}
                              onChange={handleChange}
                            />
                            {errors.company_name && (
                              <div className="invalid-feedback">{errors.company_name}</div>
                            )}
                          </div>

                          <div className="col-12">
                            <label className="form-label">Description</label>
                            <textarea
                              className={`form-control ${errors.company_description ? 'is-invalid' : ''}`}
                              name="company_description"
                              value={form.company_description}
                              onChange={handleChange}
                              rows="3"
                            />
                            {errors.company_description && (
                              <div className="invalid-feedback">{errors.company_description}</div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Website</label>
                            <input
                              type="url"
                              className={`form-control ${errors.company_website ? 'is-invalid' : ''}`}
                              name="company_website"
                              value={form.company_website}
                              onChange={handleChange}
                              placeholder="https://example.com"
                            />
                            {errors.company_website && (
                              <div className="invalid-feedback">{errors.company_website}</div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">LinkedIn</label>
                            <input
                              type="url"
                              className={`form-control ${errors.linkedin ? 'is-invalid' : ''}`}
                              name="linkedin"
                              value={form.linkedin}
                              onChange={handleChange}
                              placeholder="https://linkedin.com/company/your-company"
                            />
                            {errors.linkedin && (
                              <div className="invalid-feedback">{errors.linkedin}</div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Location</label>
                            <input
                              type="text"
                              className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                              name="location"
                              value={form.location}
                              onChange={handleChange}
                              placeholder="City, Country"
                            />
                            {errors.location && (
                              <div className="invalid-feedback">{errors.location}</div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Company Size</label>
                            <select
                              className={`form-control ${errors.company_size ? 'is-invalid' : ''}`}
                              name="company_size"
                              value={form.company_size}
                              onChange={handleChange}
                            >
                              <option value="">Select size</option>
                              <option value="1-10 employees">1-10 employees</option>
                              <option value="11-50 employees">11-50 employees</option>
                              <option value="51-200 employees">51-200 employees</option>
                              <option value="201-500 employees">201-500 employees</option>
                              <option value="500+ employees">500+ employees</option>
                            </select>
                            {errors.company_size && (
                              <div className="invalid-feedback">{errors.company_size}</div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Founded Year</label>
                            <input
                              type="text"
                              className={`form-control ${errors.founded_year ? 'is-invalid' : ''}`}
                              name="founded_year"
                              value={form.founded_year}
                              onChange={handleChange}
                              placeholder="YYYY"
                            />
                            {errors.founded_year && (
                              <div className="invalid-feedback">{errors.founded_year}</div>
                            )}
                          </div>

                          <div className="col-12 mt-4">
                            <button 
                              type="submit" 
                              className="btn btn-primary px-4"
                              disabled={loading}
                            >
                              {loading ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              ) : (
                                <i className="bi bi-check-circle me-2"></i>
                              )}
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="recruiter-profile-header">
                          <div>
                            {form.image ? (
                              <img 
                                src={form.image} 
                                alt="Company logo" 
                                className="recruiter-profile-logo" 
                              />
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center recruiter-profile-logo">
                                <i className="bi bi-building text-muted" style={{ fontSize: '2.5rem' }}></i>
                              </div>
                            )}
                          </div>
                          <div className="recruiter-profile-info">
                            <div className="recruiter-profile-title">{form.company_name}</div>
                            <div className="recruiter-profile-location"><i className="bi bi-geo-alt me-1"></i> {form.location || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="recruiter-profile-description">{form.company_description}</div>
                        <div className="recruiter-profile-meta">
                          <div className="recruiter-profile-meta-item">
                            <i className="bi bi-globe me-1"></i>
                            {form.company_website ? (
                              <a href={form.company_website} target="_blank" rel="noopener noreferrer">
                                {form.company_website}
                              </a>
                            ) : (
                              <span>Website: Not provided</span>
                            )}
                          </div>
                          <div className="recruiter-profile-meta-item">
                            <i className="bi bi-people me-1"></i>
                            {form.company_size || 'Company size: Not provided'}
                          </div>
                          <div className="recruiter-profile-meta-item">
                            <i className="bi bi-calendar me-1"></i>
                            {form.founded_year || 'Founded: Not provided'}
                          </div>
                        </div>
                        {form.linkedin && (
                          <div className="recruiter-profile-linkedin">
                            <a 
                              href={form.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <i className="bi bi-linkedin me-1"></i>
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-bottom py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                        Posted Jobs
                      </h5>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowJobModal(true)}
                        disabled={(() => {
                          // If recruiterPaid=1 in localStorage, never disable
                          if (localStorage.getItem('recruiterPaid') === '1') return false;
                          return jobs.length >= 5 && !isPaid;
                        })()}
                        title={(() => {
                          if (localStorage.getItem('recruiterPaid') === '1') return '';
                          return jobs.length >= 5 && !isPaid ? 'Payment required to post more than 5 jobs' : '';
                        })()}
                      >
                        <i className="bi bi-plus me-1"></i>
                        Post New Job
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Only show warning if not paid, job limit reached, and recruiterPaid is not set */}
                    {(!isPaid && jobs.length >= 5 && localStorage.getItem('recruiterPaid') !== '1') && (
                      <div className="alert alert-warning d-flex align-items-center mb-4">
                        <i className="bi bi-credit-card-2-front me-2"></i>
                        <div>
                          You have reached your free job posting limit. <Link to="/payment">Make a payment</Link> to post more jobs.
                        </div>
                      </div>
                    )}
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                        <h5 className="mt-3">No jobs posted yet</h5>
                        <p className="text-muted">Your posted jobs will appear here</p>
                        <button 
                          className="btn btn-primary mt-2"
                          onClick={() => setShowJobModal(true)}
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Post Your First Job
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="recruiter-jobs-list">
                          {paginatedJobs.map(job => (
                            <div key={job._id || job.id} className="recruiter-job-card">
                              <div className="recruiter-job-title">
                                <Link to={`/jobs/${job._id || job.id}`} className="text-decoration-none text-primary">
                                  {job.title}
                                </Link>
                              </div>
                              <div className="recruiter-job-desc">
                                {job.description.substring(0, 120)}{job.description.length > 120 ? '...' : ''}
                              </div>
                              <div className="recruiter-job-meta">
                                <span><i className="bi bi-calendar me-1"></i> {new Date(job.created_at).toLocaleDateString()}</span>
                                <span className="recruiter-job-badge">{job.status}</span>
                                <span><i className="bi bi-geo-alt me-1"></i> {job.governorate}</span>
                              </div>
                              <div className="recruiter-job-actions">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleViewJobApplications(job._id || job.id)}
                                >
                                  <i className="bi bi-people me-1"></i>
                                  View Applications
                                </button>
                                <button
                                  className="btn btn-outline-secondary btn-sm ms-2"
                                  onClick={() => navigate(`/edit-job/${job._id || job.id}`)}
                                  title="Edit Job"
                                >
                                  <i className="bi bi-pencil-square me-1"></i>
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    setDeleteJobId(job._id || job.id);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Pagination UI */}
                        {jobs.length > jobsPerPage && (
                          <div className="recruiter-pagination">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={page => setCurrentPage(page)}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Posting Modal */}
      {showJobModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Post New Job</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowJobModal(false);
                    setJobErrors({});
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleJobSubmit}>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Job Title</label>
                      <input
                        type="text"
                        className={`form-control ${jobErrors.title ? 'is-invalid' : ''}`}
                        name="title"
                        value={jobForm.title}
                        onChange={handleJobChange}
                        placeholder="e.g. Senior Frontend Developer"
                      />
                      {jobErrors.title && (
                        <div className="invalid-feedback">{jobErrors.title}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        className={`form-control ${jobErrors.specialization ? 'is-invalid' : ''}`}
                        name="specialization"
                        value={jobForm.specialization}
                        onChange={handleJobChange}
                        placeholder="e.g. Web Development"
                      />
                      {jobErrors.specialization && (
                        <div className="invalid-feedback">{jobErrors.specialization}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className={`form-control ${jobErrors.governorate ? 'is-invalid' : ''}`}
                        name="governorate"
                        value={jobForm.governorate}
                        onChange={handleJobChange}
                        placeholder="e.g. Cairo, Egypt"
                      />
                      {jobErrors.governorate && (
                        <div className="invalid-feedback">{jobErrors.governorate}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Job Description</label>
                      <textarea
                        className={`form-control ${jobErrors.description ? 'is-invalid' : ''}`}
                        name="description"
                        value={jobForm.description}
                        onChange={handleJobChange}
                        rows="6"
                        placeholder="Describe the job responsibilities, requirements, and benefits..."
                      ></textarea>
                      {jobErrors.description && (
                        <div className="invalid-feedback">{jobErrors.description}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-control"
                        name="status"
                        value={jobForm.status}
                        onChange={handleJobChange}
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Work Mode</label>
                      <select
                        className="form-control"
                        name="work_mode"
                        value={jobForm.work_mode}
                        onChange={handleJobChange}
                      >
                        <option value="onsite">Onsite</option>
                        <option value="remotely">Remotely</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Job Type</label>
                      <select
                        className="form-control"
                        name="job_type"
                        value={jobForm.job_type}
                        onChange={handleJobChange}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="by task">By Task</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer mt-4">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowJobModal(false);
                        setJobErrors({});
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      ) : (
                        <i className="bi bi-check-circle me-2"></i>
                      )}
                      Post Job
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteJobId(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this job?</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteJobId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteJob(deleteJobId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}