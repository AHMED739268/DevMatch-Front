import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, User, AlertCircle, Loader2, ExternalLink, FileText, Calendar, Building2, Eye } from 'lucide-react';
import '../styles/ApplicationsList.css';
import { useAuthStore } from '../store/useAuthStore';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Previous
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn${currentPage === page ? ' active' : ''}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const currentUser = useAuthStore(state => state.authUser);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/applications/my-applications`,
        {
          params: { page, limit: 6 },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from server');
      }

      // Handle both possible response formats
      const appsData = response.data.data || response.data.applications || [];
      setApplications(Array.isArray(appsData) ? appsData : []);
      setTotalPages(response.data.meta?.pages || response.data.pages || 1);
      setTotalApplications(response.data.meta?.total || response.data.total || 0);

    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id || currentUser?.id) {
      fetchApplications();
    }
  }, [currentUser, page]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (loading) {
    return (
      <div className="applications-bg">
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <Loader2 className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4" />
            <p className="text-slate-700 font-medium text-lg">Loading your applications...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-bg p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-red-800 font-bold text-lg">Error Loading Applications</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-red-700 text-base leading-relaxed">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="applications-bg p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No Applications Yet
              </h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                You haven't applied to any jobs yet. Start exploring opportunities and take the first step towards your dream career!
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="applications-header">
          <h1 className="applications-header-title">
            Your Job Applications
          </h1>
          <p className="applications-header-desc">
            Track your application progress and stay updated on your job search journey
          </p>
          <div className="applications-header-count">
            <Calendar style={{ width: 20, height: 20, color: '#2563eb', marginRight: 8 }} />
            <span>
              Showing {(page - 1) * 6 + 1}-{Math.min(page * 6, totalApplications)} of {totalApplications} applications
            </span>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {applications.map((application) => {
            if (!application || !application.job_id) {
              return null;
            }

            const job = application.job_id;
            const recruiter = job.recruiter_id;

            return (
              <div key={application._id} className="group">
                <div className="application-card">
                  {/* Status Badge */}
                  <div className="application-card-status">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(application.status)}`}>
                      <span className="mr-1.5">{getStatusIcon(application.status)}</span>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(application.applied_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="application-card-main">
                    {/* Job Title & Company */}
                    <div className="mb-4">
                      <h3 className="application-card-title group-hover:text-blue-600">
                        <Link 
                          to={`/jobs/${job._id}`}
                          className="hover:underline text-left"
                        >
                          {job.title || 'Untitled Position'}
                        </Link>
                      </h3>
                      <div className="application-card-company mb-2">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">{recruiter?.company_name || 'Unknown Company'}</span>
                      </div>
                      <div className="application-card-specialization">
                        <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{job.specialization || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="application-card-details">
                      {job.governorate && (
                        <div className="application-card-detail">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{job.governorate}</span>
                        </div>
                      )}
                      {job.salary_range && (
                        <div className="application-card-detail">
                          <span className="w-4 h-4 mr-2 text-blue-500 font-bold">$</span>
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                      {recruiter?.name && (
                        <div className="application-card-detail">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{recruiter.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Cover Letter Preview */}
                    {application.cover_letter && (
                      <div className="application-card-cover">
                        <h4 className="application-card-cover-title">
                          <FileText className="w-4 h-4 mr-1" />
                          Cover Letter
                        </h4>
                        <p className="application-card-cover-text">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="application-card-actions">
                      {application.cv_url && (
                        <a
                          href={application.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="application-card-btn"
                        >
                          <ExternalLink className="w-4 h-4 mr-1.5" />
                          View CV
                        </a>
                      )}
                      <Link
                        to={`/jobs/${job._id}`}
                        className="application-card-btn application-card-btn-primary"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Job
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 pagination-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          </div>
        )}
      </div> 
    </div>
  );
};

export default ApplicationsList;